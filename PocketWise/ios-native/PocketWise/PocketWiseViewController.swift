import UIKit
import WebKit
import Vision
import VisionKit

private final class WeakScriptMessageHandler: NSObject, WKScriptMessageHandler {
    weak var delegate: WKScriptMessageHandler?

    init(delegate: WKScriptMessageHandler) {
        self.delegate = delegate
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        delegate?.userContentController(userContentController, didReceive: message)
    }
}

/// Optional native iOS host for the existing PocketWise web app.
/// No page layout is recreated here: the existing hosted UI is loaded unchanged in WKWebView.
@MainActor
final class PocketWiseViewController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate {
    private var webView: WKWebView!
    private let scriptController = WKUserContentController()
    private lazy var weakMessageHandler = WeakScriptMessageHandler(delegate: self)
    private let appURL = URL(string: "https://nithan.in/PocketWise/")!
    private let maxImageBytes = 8 * 1024 * 1024
    @available(iOS 16.0, *)
    private static let imageAnalyzer = ImageAnalyzer()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black

        scriptController.add(weakMessageHandler, name: "pocketWiseVisionOCR")
        let configuration = WKWebViewConfiguration()
        configuration.userContentController = scriptController
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.backgroundColor = .black
        webView.isOpaque = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsBackForwardNavigationGestures = true
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        webView.load(URLRequest(url: appURL, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30))
    }

    deinit {
        scriptController.removeScriptMessageHandler(forName: "pocketWiseVisionOCR")
    }

    private func isTrustedPocketWiseURL(_ url: URL?) -> Bool {
        guard let url else { return false }
        return url.scheme?.lowercased() == "https" &&
            url.host?.lowercased() == "nithan.in" &&
            (url.path == "/PocketWise" || url.path.hasPrefix("/PocketWise/"))
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        if isTrustedPocketWiseURL(url) {
            decisionHandler(.allow)
        } else {
            if navigationAction.navigationType == .linkActivated,
               url.scheme?.lowercased() == "https" {
                UIApplication.shared.open(url)
            }
            decisionHandler(.cancel)
        }
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url, !isTrustedPocketWiseURL(url), url.scheme?.lowercased() == "https" {
            UIApplication.shared.open(url)
        }
        return nil
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "pocketWiseVisionOCR",
              message.frameInfo.isMainFrame,
              isTrustedPocketWiseURL(message.frameInfo.request.url),
              let body = message.body as? [String: Any],
              let requestID = body["requestId"] as? String,
              requestID.range(of: #"^pwo_[a-z0-9]+_[a-z0-9]{1,16}$"#, options: .regularExpression) != nil,
              let base64 = body["base64"] as? String,
              base64.utf8.count <= 11_200_000,
              let imageData = Data(base64Encoded: base64),
              !imageData.isEmpty, imageData.count <= maxImageBytes else {
            return
        }

        Task { [weak self] in
            guard let self else { return }
            do {
                let started = Date()
                let recognized = try await Self.recognizeText(imageData)
                guard !recognized.isEmpty else { throw OCRBridgeError.noText }
                self.sendResult(requestID: requestID, text: recognized, error: nil,
                                elapsedMilliseconds: Int(Date().timeIntervalSince(started) * 1000))
            } catch {
                self.sendResult(requestID: requestID, text: "", error: error.localizedDescription,
                                elapsedMilliseconds: 0)
            }
        }
    }

    /// iOS 16+ uses VisionKit's on-device ImageAnalyzer. iOS 15 uses Vision's fast text request.
    private static func recognizeText(_ data: Data) async throws -> String {
        guard let image = UIImage(data: data) else { throw OCRBridgeError.invalidImage }

        if #available(iOS 16.0, *), ImageAnalyzer.isSupported {
            var configuration = ImageAnalyzer.Configuration([.text])
            let supported = ImageAnalyzer.supportedTextRecognitionLanguages
            let preferred = ["en-IN", "en-US"].filter { supported.contains($0) }
            if !preferred.isEmpty { configuration.locales = preferred }
            let analysis = try await imageAnalyzer.analyze(image, configuration: configuration)
            return analysis.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        }

        guard let cgImage = image.cgImage else { throw OCRBridgeError.invalidImage }
        return try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let request = VNRecognizeTextRequest { request, error in
                    if let error {
                        continuation.resume(throwing: error)
                        return
                    }
                    let observations = request.results as? [VNRecognizedTextObservation] ?? []
                    let text = observations.compactMap { $0.topCandidates(1).first?.string }
                        .joined(separator: "\n")
                        .trimmingCharacters(in: .whitespacesAndNewlines)
                    continuation.resume(returning: text)
                }
                request.recognitionLevel = .fast
                request.usesLanguageCorrection = false
                if let supported = try? VNRecognizeTextRequest.supportedRecognitionLanguages(
                    for: .fast, revision: VNRecognizeTextRequest.currentRevision
                ) {
                    let preferred = ["en-IN", "en-US"].filter { supported.contains($0) }
                    if !preferred.isEmpty { request.recognitionLanguages = preferred }
                }
                do {
                    try VNImageRequestHandler(cgImage: cgImage, options: [:]).perform([request])
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    private func sendResult(requestID: String, text: String, error: String?, elapsedMilliseconds: Int) {
        let payload: [String: Any] = [
            "requestId": requestID,
            "text": String(text.prefix(40_000)),
            "engine": "Apple VisionKit",
            "elapsedMs": max(0, elapsedMilliseconds),
            "error": error.map { $0 as Any } ?? NSNull()
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: payload, options: [.fragmentsAllowed, .sortedKeys]),
              let json = String(data: data, encoding: .utf8) else { return }
        webView.evaluateJavaScript("window.PocketWiseOCRNativeResult && window.PocketWiseOCRNativeResult(\(json));", completionHandler: nil)
    }
}

private enum OCRBridgeError: LocalizedError {
    case invalidImage
    case noText

    var errorDescription: String? {
        switch self {
        case .invalidImage: return "The selected image could not be opened for native OCR."
        case .noText: return "No readable text was found in this image."
        }
    }
}
