package in.pocketwise.widget

import android.app.Activity
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.json.JSONObject
import java.lang.reflect.InvocationTargetException
import kotlin.coroutines.Continuation
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine
import kotlin.coroutines.intrinsics.COROUTINE_SUSPENDED

/**
 * Small JavaScript bridge for the official PaddleOCR Android SDK.
 * The SDK/model payload is prepared by tools/prepare_native_ocr.py; until then this bridge
 * reports unavailable and the web UI safely falls back to its existing browser OCR engine.
 */
class PaddleOcrJsBridge(
    private val activity: Activity,
    private val webView: WebView,
    private val bridgeToken: String,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val initMutex = Mutex()
    private val inferenceMutex = Mutex()

    @Volatile private var ocrEngine: Any? = null
    @Volatile private var isClosed = false

    @JavascriptInterface
    fun isAvailable(token: String?): Boolean {
        if (isClosed || !isTrustedToken(token)) return false
        return try {
            Class.forName("com.paddle.ocr.PaddleOCR")
            activity.assets.open("models/det/inference.onnx").use { }
            activity.assets.open("models/rec/inference.onnx").use { }
            activity.assets.open("models/rec/inference.yml").use { }
            true
        } catch (_: Throwable) {
            false
        }
    }

    /** Base64 input is bounded and only accepted for a small, generated request id. */
    @JavascriptInterface
    fun recognizeImageBase64(base64: String?, requestId: String?, token: String?): Boolean {
        if (isClosed || !isTrustedToken(token) || requestId == null || base64 == null || !validRequestId(requestId) || base64.isBlank() || base64.length > MAX_BASE64_CHARS) return false
        if (!base64.matches(Regex("^[A-Za-z0-9+/=\\r\\n]+$"))) {
            deliver(requestId, "", "Image payload was not valid Base64.", 0L)
            return false
        }
        scope.launch {
            val started = System.currentTimeMillis()
            try {
                if (!isAvailable(bridgeToken)) throw IllegalStateException("PaddleOCR is not prepared. Run tools/prepare_native_ocr.py and rebuild the Android app.")
                val imageBytes = Base64.decode(base64, Base64.DEFAULT)
                if (imageBytes.isEmpty() || imageBytes.size > MAX_IMAGE_BYTES) {
                    throw IllegalArgumentException("Image exceeds the native OCR size limit.")
                }
                val engine = getEngine()
                val result = inferenceMutex.withLock { invokeSuspend(engine, "recognize", imageBytes) }
                    ?: throw IllegalStateException("PaddleOCR returned no result.")
                val rows = result.javaClass.getMethod("getResults").invoke(result) as? Iterable<*>
                val text = rows.orEmpty().mapNotNull { row ->
                    if (row == null) null else runCatching {
                        row.javaClass.getMethod("getText").invoke(row)?.toString()?.trim()
                    }.getOrNull()
                }.filter { !it.isNullOrBlank() }.joinToString("\n")
                if (text.isBlank()) throw IllegalStateException("No readable text was found in this image.")
                deliver(requestId, text, null, System.currentTimeMillis() - started)
            } catch (error: Throwable) {
                val message = (error.cause ?: error).message ?: "PaddleOCR failed."
                deliver(requestId, "", message.take(240), System.currentTimeMillis() - started)
            }
        }
        return true
    }

    private suspend fun getEngine(): Any = initMutex.withLock {
        ocrEngine?.let { return@withLock it }
        // The official PaddleOCR Android SDK requires OpenCV's native library to be loaded
        // before the first engine is created. Do this once under the same init lock.
        val openCvClass = Class.forName("com.paddle.ocr.util.OpenCVUtils")
        val openCvInstance = openCvClass.getField("INSTANCE").get(null)
        val openCvInit = openCvClass.getMethod("init", android.content.Context::class.java)
        val openCvReady = openCvInit.invoke(openCvInstance, activity.applicationContext) as? Boolean ?: false
        if (!openCvReady) throw IllegalStateException("OpenCV could not initialize for PaddleOCR.")

        val sdkClass = Class.forName("com.paddle.ocr.PaddleOCR")
        val companion = sdkClass.getField("Companion").get(null)
        val created = invokeSuspend(companion, "create", activity.applicationContext)
            ?: throw IllegalStateException("PaddleOCR could not initialise its models.")
        ocrEngine = created
        created
    }

    /** Invoke a Kotlin suspend API reflectively, keeping the bridge buildable before optional SDK setup. */
    private suspend fun invokeSuspend(receiver: Any, methodName: String, vararg args: Any): Any? = suspendCoroutine { continuation ->
        val method = receiver.javaClass.methods.firstOrNull { candidate ->
            candidate.name == methodName &&
                candidate.parameterCount == args.size + 1 &&
                Continuation::class.java.isAssignableFrom(candidate.parameterTypes.last()) &&
                args.indices.all { index -> candidate.parameterTypes[index].isAssignableFrom(args[index].javaClass) }
        }
        if (method == null) {
            continuation.resumeWithException(NoSuchMethodException("PaddleOCR API '$methodName' was not found."))
            return@suspendCoroutine
        }
        try {
            val returned = method.invoke(receiver, *(args.toList() + continuation).toTypedArray())
            if (returned !== COROUTINE_SUSPENDED) continuation.resume(returned)
        } catch (error: InvocationTargetException) {
            continuation.resumeWithException(error.targetException ?: error)
        } catch (error: Throwable) {
            continuation.resumeWithException(error)
        }
    }

    private fun deliver(requestId: String, text: String, error: String?, elapsedMs: Long) {
        if (!validRequestId(requestId) || isClosed) return
        val payload = JSONObject()
            .put("requestId", requestId)
            .put("text", text.take(MAX_OCR_TEXT_CHARS))
            .put("engine", "PaddleOCR")
            .put("elapsedMs", elapsedMs.coerceAtLeast(0))
            .put("error", error ?: JSONObject.NULL)
            .toString()
        activity.runOnUiThread {
            if (isClosed || activity.isFinishing || (android.os.Build.VERSION.SDK_INT >= 17 && activity.isDestroyed)) return@runOnUiThread
            webView.evaluateJavascript("window.PocketWiseOCRNativeResult && window.PocketWiseOCRNativeResult($payload);", null)
        }
    }

    fun shutdown() {
        if (isClosed) return
        isClosed = true
        val engine = ocrEngine
        scope.launch {
            try {
                if (engine != null) runCatching { invokeSuspend(engine, "release") }
            } finally {
                ocrEngine = null
                scope.cancel()
            }
        }
    }

    private fun validRequestId(value: String): Boolean = value.matches(Regex("^pwo_[a-z0-9]+_[a-z0-9]{1,16}$"))

    private fun isTrustedToken(candidate: String?): Boolean {
        if (candidate.isNullOrEmpty()) return false
        return java.security.MessageDigest.isEqual(
            bridgeToken.toByteArray(Charsets.UTF_8),
            candidate.toByteArray(Charsets.UTF_8),
        )
    }

    companion object {
        private const val MAX_BASE64_CHARS = 11_200_000
        private const val MAX_IMAGE_BYTES = 8 * 1024 * 1024
        private const val MAX_OCR_TEXT_CHARS = 40_000
    }
}
