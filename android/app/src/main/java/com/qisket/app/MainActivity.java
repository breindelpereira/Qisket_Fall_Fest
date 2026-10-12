package com.qisket.app;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // plugins written for this app are registered before the bridge starts
        registerPlugin(ImmersivePlugin.class);
        super.onCreate(savedInstanceState);

        // Android 15 and later draw apps under the status bar and the navigation buttons. Capacitor's own margin setting
        // keeps the app between them, but it ignores the on-screen keyboard, which then covers the bottom of the page
        // (including the tutor's question box). This does the same job and also lifts the page above the keyboard.
        View webView = getBridge().getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(webView, (v, windowInsets) -> {
            // While the bars are hidden for full-screen video the page may use the whole screen, notch included
            boolean barsShown = windowInsets.isVisible(WindowInsetsCompat.Type.statusBars());
            Insets bars = barsShown
                ? windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout())
                : Insets.NONE;
            Insets keyboard = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
            ViewGroup.MarginLayoutParams margins = (ViewGroup.MarginLayoutParams) v.getLayoutParams();
            margins.leftMargin = bars.left;
            margins.topMargin = bars.top;
            margins.rightMargin = bars.right;
            margins.bottomMargin = Math.max(bars.bottom, keyboard.bottom);
            v.setLayoutParams(margins);
            // Do not pass the insets on to the web page
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(webView);

        // Back button: Capacitor core does not handle it (that is the @capacitor/app plugin, which this app does not use),
        // so Android would close the activity at once. The page pushes one history entry per screen (see
        // src/hooks/useBackNavigation.ts); here the web view walks back through them, and only on the first screen does
        // the button leave the app.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView web = getBridge().getWebView();
                if (web != null && web.canGoBack()) {
                    web.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }
}
