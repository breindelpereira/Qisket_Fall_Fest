package com.qisket.app;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.os.Build;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Hides the status bar and the navigation buttons while a lesson video is full screen, and brings them back afterwards.
 * A swipe from the edge shows them for a moment, so the phone is never stuck. The page calls it as
 * {@code Immersive.set({ on: true })} (see src/utils/immersive.ts).
 */
@CapacitorPlugin(name = "Immersive")
public class ImmersivePlugin extends Plugin {

    @PluginMethod
    public void set(PluginCall call) {
        final boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("No activity");
            return;
        }
        activity.runOnUiThread(() -> {
            Window window = activity.getWindow();
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
            // landscape while a video is full screen (like any video app); back to the phone's own setting afterwards
            activity.setRequestedOrientation(on ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE : ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                WindowManager.LayoutParams attributes = window.getAttributes();
                attributes.layoutInDisplayCutoutMode = on
                    ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                    : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT;
                window.setAttributes(attributes);
            }
            if (on) {
                controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                controller.hide(WindowInsetsCompat.Type.systemBars());
            } else {
                controller.show(WindowInsetsCompat.Type.systemBars());
            }
            call.resolve();
        });
    }
}
