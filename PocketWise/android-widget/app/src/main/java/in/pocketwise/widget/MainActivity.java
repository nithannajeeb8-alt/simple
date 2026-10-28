package in.pocketwise.widget;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowInsetsController;
import android.view.inputmethod.InputMethodManager;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.widget.Toast;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.content.Context;
import android.content.Intent;
import android.content.ContentValues;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.webkit.CookieManager;

import java.io.File;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://nithan.in/PocketWise/";
    private static final String APP_HOST = "nithan.in";
    private static final String APP_PATH = "/PocketWise/";
    private WebView web;
    private PaddleOcrJsBridge paddleOcrBridge;
    private final String nativeOcrToken = UUID.randomUUID().toString().replace("-", "");

    private static boolean isTrustedPocketWiseUrl(Uri uri) {
        if (uri == null || !"https".equalsIgnoreCase(uri.getScheme())) return false;
        if (!APP_HOST.equalsIgnoreCase(uri.getHost())) return false;
        if (uri.getPort() != -1 && uri.getPort() != 443) return false;
        if (uri.getUserInfo() != null) return false;
        String path = uri.getPath();
        return path != null && (path.equals("/PocketWise") || path.startsWith(APP_PATH));
    }

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        WebView.setWebContentsDebuggingEnabled(false);
        web = new WebView(this);
        // Start on a pure-black canvas so the initial window never flashes the old green theme.
        web.setBackgroundColor(Color.BLACK);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        web.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        applyNativeSystemBars("dark");
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setGeolocationEnabled(false);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) settings.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
        web.addJavascriptInterface(new PocketBridge(this), "PocketWiseNative");
        paddleOcrBridge = new PaddleOcrJsBridge(this, web, nativeOcrToken);
        web.addJavascriptInterface(paddleOcrBridge, "PocketWisePaddleOCR");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Uri loadedUri;
                try { loadedUri = Uri.parse(url); } catch (Exception ignored) { return; }
                if (!isTrustedPocketWiseUrl(loadedUri)) return;
                // The random token is injected only into the trusted top-level document. A cross-origin
                // iframe can't read parent JS state and therefore can't invoke the OCR bridge successfully.
                String quotedToken = org.json.JSONObject.quote(nativeOcrToken);
                view.evaluateJavascript("window.__PocketWiseNativeOcrToken = " + quotedToken + ";", null);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isTrustedPocketWiseUrl(uri)) return false;
                // Never let untrusted frames navigate the bridge-enabled WebView.
                if (!request.isForMainFrame()) return true;
                // Preserve ordinary HTTPS links by opening them outside the bridge-enabled WebView.
                if ("https".equalsIgnoreCase(uri.getScheme()) && uri.getHost() != null) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) { }
                }
                return true;
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri uri;
                try { uri = Uri.parse(url); } catch (Exception ignored) { return true; }
                if (isTrustedPocketWiseUrl(uri)) return false;
                if ("https".equalsIgnoreCase(uri.getScheme()) && uri.getHost() != null) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) { }
                }
                return true;
            }
        });
        setContentView(web);
        web.loadUrl(APP_URL);
    }

    /** Keep system bar backgrounds and icon contrast aligned with PocketWise's resolved theme. */
    private void applyNativeSystemBars(String theme) {
        final boolean light = "light".equals(theme);
        final int background = light ? Color.WHITE : Color.BLACK;
        final Window window = getWindow();
        // Android 15 enforces edge-to-edge for targetSdk 35. Let the WebView/page background
        // show through system bars there; older versions use an explicit matching color.
        if (Build.VERSION.SDK_INT >= 35) {
            window.setStatusBarColor(Color.TRANSPARENT);
            window.setNavigationBarColor(Color.TRANSPARENT);
        } else {
            window.setStatusBarColor(background);
            window.setNavigationBarColor(background);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setStatusBarContrastEnforced(false);
            // The page background already supplies contrast, including in three-button mode.
            window.setNavigationBarContrastEnforced(false);
        }
        window.getDecorView().setBackgroundColor(background);
        if (web != null) web.setBackgroundColor(background);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                int mask = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                        | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                controller.setSystemBarsAppearance(light ? mask : 0, mask);
            }
        } else {
            int flags = window.getDecorView().getSystemUiVisibility();
            int lightFlags = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                lightFlags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
            flags = light ? (flags | lightFlags) : (flags & ~lightFlags);
            window.getDecorView().setSystemUiVisibility(flags);
        }
    }

    @Override
    protected void onDestroy() {
        if (paddleOcrBridge != null) { paddleOcrBridge.shutdown(); paddleOcrBridge = null; }
        if (web != null) {
            web.removeJavascriptInterface("PocketWiseNative");
            web.removeJavascriptInterface("PocketWisePaddleOCR");
            web.stopLoading();
            web.loadUrl("about:blank");
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    public static class PocketBridge {
        private final Context context;
        private final MainActivity activity;
        PocketBridge(MainActivity value) {
            activity = value;
            context = value.getApplicationContext();
        }

        /** Dismiss the Android soft keyboard after an explicit HTML Done action. */
        @JavascriptInterface
        public void hideKeyboard() {
            activity.runOnUiThread(() -> {
                if (activity.isFinishing() || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1 && activity.isDestroyed())) return;
                try {
                    InputMethodManager manager = (InputMethodManager) activity.getSystemService(Context.INPUT_METHOD_SERVICE);
                    View focus = activity.getCurrentFocus();
                    if (focus == null) focus = activity.web;
                    if (manager != null && focus != null && focus.getWindowToken() != null) {
                        manager.hideSoftInputFromWindow(focus.getWindowToken(), 0);
                    }
                } catch (Exception error) {
                    android.util.Log.d("PocketWise", "Soft keyboard was already dismissed.", error);
                }
            });
        }

        @JavascriptInterface
        public void setSystemBarsTheme(String theme) {
            if (!"light".equals(theme) && !"dark".equals(theme)) return;
            activity.runOnUiThread(() -> {
                if (!activity.isFinishing() && (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN_MR1 || !activity.isDestroyed())) {
                    activity.applyNativeSystemBars(theme);
                }
            });
        }

        private static boolean validReceiptFilename(String filename) {
            return filename != null && filename.matches("PocketWise-Receipt-[A-Za-z0-9_-]{1,70}\\.html");
        }

        @JavascriptInterface
        public boolean saveReceiptHtml(String filename, String html) {
            if (!validReceiptFilename(filename) || html == null || html.length() > 100_000
                    || !html.trim().toLowerCase(java.util.Locale.ROOT).startsWith("<!doctype html>")
                    || !html.contains("id=\"receipt-paper\"")) return false;
            try {
                byte[] bytes = html.getBytes(StandardCharsets.UTF_8);
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
                    values.put(MediaStore.Downloads.MIME_TYPE, "text/html");
                    values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/PocketWise");
                    values.put(MediaStore.Downloads.IS_PENDING, 1);
                    Uri target = context.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (target == null) return false;
                    try (OutputStream output = context.getContentResolver().openOutputStream(target)) {
                        if (output == null) throw new java.io.IOException("Could not open the receipt file.");
                        output.write(bytes);
                        output.flush();
                    } catch (Exception writeError) {
                        context.getContentResolver().delete(target, null, null);
                        throw writeError;
                    }
                    ContentValues ready = new ContentValues();
                    ready.put(MediaStore.Downloads.IS_PENDING, 0);
                    context.getContentResolver().update(target, ready, null, null);
                    return true;
                }
                File base = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (base == null) return false;
                File directory = new File(base, "PocketWise");
                if (!directory.exists() && !directory.mkdirs()) return false;
                File receipt = new File(directory, filename);
                try (OutputStream output = new java.io.FileOutputStream(receipt)) {
                    output.write(bytes);
                    output.flush();
                }
                return true;
            } catch (Exception error) {
                android.util.Log.e("PocketWise", "Receipt export failed", error);
                return false;
            }
        }

        @JavascriptInterface
        public void shareReceipt(String title, String text) {
            if (title == null || title.length() > 100 || text == null || text.length() > 4000) return;
            activity.runOnUiThread(() -> {
                try {
                    Intent send = new Intent(Intent.ACTION_SEND);
                    send.setType("text/plain");
                    send.putExtra(Intent.EXTRA_SUBJECT, title.replaceAll("[\\r\\n]", " "));
                    send.putExtra(Intent.EXTRA_TEXT, text);
                    activity.startActivity(Intent.createChooser(send, "Share PocketWise receipt"));
                } catch (Exception error) {
                    Toast.makeText(activity, "Could not open sharing on this device.", Toast.LENGTH_LONG).show();
                }
            });
        }

        @JavascriptInterface
        public void printReceipt() {
            activity.runOnUiThread(() -> {
                try {
                    if (Build.VERSION.SDK_INT < 19 || activity.isFinishing() || activity.isDestroyed() || activity.web == null) {
                        Toast.makeText(activity, "Printing is not available on this device.", Toast.LENGTH_LONG).show();
                        return;
                    }
                    PrintManager printManager = (PrintManager) activity.getSystemService(Context.PRINT_SERVICE);
                    if (printManager == null) {
                        Toast.makeText(activity, "Printing is not available on this device.", Toast.LENGTH_LONG).show();
                        return;
                    }
                    PrintDocumentAdapter adapter = activity.web.createPrintDocumentAdapter("PocketWise receipt");
                    PrintAttributes attributes = new PrintAttributes.Builder()
                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                            .setResolution(new PrintAttributes.Resolution("pocketwise_receipt", "PocketWise receipt", 300, 300))
                            .build();
                    printManager.print("PocketWise receipt", adapter, attributes);
                } catch (Exception error) {
                    android.util.Log.e("PocketWise", "Receipt printing failed", error);
                    Toast.makeText(activity, "Could not open printing. Use Download copy instead.", Toast.LENGTH_LONG).show();
                }
            });
        }

        private static boolean safeDisplay(String value, int maxLength) {
            return value != null && value.length() <= maxLength && value.matches("[\\p{Sc}0-9, .+\\-·a-zA-Z]*");
        }

        @JavascriptInterface
        public void updateWidget(String balance, String week) {
            // Only accept small, display-only financial strings from the trusted app page.
            // Reject control characters, markup and arbitrary text before writing widget storage.
            if (!safeDisplay(balance, 40) || !safeDisplay(week, 80) || !week.startsWith("7-day spending · ")) return;
            if (!balance.matches(".*\\d.*") || !week.substring("7-day spending · ".length()).matches(".*\\d.*")) return;
            context.getSharedPreferences("pw_widget", Context.MODE_PRIVATE)
                    .edit().putString("balance", balance).putString("week", week).apply();
            PocketWiseWidgetProvider.updateAll(context);
        }
    }
}
