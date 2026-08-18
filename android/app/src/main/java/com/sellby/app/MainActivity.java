package com.sellby.app;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SELLBY_NATIVE";
    private static final int MIC_PERMISSION_REQUEST_CODE = 1001;
    private static final int SPEECH_REQUEST_CODE = 1002;
    private static final int NOTIFICATION_PERMISSION_REQUEST_CODE = 1003;
    private static final String CHANNEL_ID = "sellby_default_channel";
    private static final String CHANNEL_NAME = "SELLBY Notifications";
    private static int notificationId = 1000;
    private String currentRequestedLang = "en-IN";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        createNotificationChannel();

        WebView webView = bridge.getWebView();
        if (webView != null) {
            webView.addJavascriptInterface(new AndroidSpeechInterface(), "AndroidSpeech");
            webView.addJavascriptInterface(new AndroidNotificationInterface(), "AndroidNotification");
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                if (notificationManager.getNotificationChannel(CHANNEL_ID) == null) {
                    NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        CHANNEL_NAME,
                        NotificationManager.IMPORTANCE_DEFAULT
                    );
                    channel.setDescription("Notifications for SELLBY messages and updates");
                    
                    Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                    AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build();
                    
                    channel.setSound(defaultSoundUri, audioAttributes);
                    channel.enableVibration(true);
                    
                    notificationManager.createNotificationChannel(channel);
                }
            }
        }
    }

    private boolean hasNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATION_PERMISSION_REQUEST_CODE);
        }
    }

    public void showSystemNotification(String title, String body) {
        if (!hasNotificationPermission()) {
            requestNotificationPermission();
            return;
        }

        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager == null) return;

        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            intent, 
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent);

        notificationManager.notify(notificationId++, builder.build());
    }

    public class AndroidNotificationInterface {
        @JavascriptInterface
        public void showNotification(final String title, final String body) {
            runOnUiThread(() -> {
                showSystemNotification(title, body);
            });
        }

        @JavascriptInterface
        public void requestPermission() {
            runOnUiThread(() -> {
                if (!hasNotificationPermission()) {
                    requestNotificationPermission();
                }
            });
        }
    }

    private boolean hasMicPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestMicPermission() {
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, MIC_PERMISSION_REQUEST_CODE);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == MIC_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                launchSpeechIntent(currentRequestedLang);
            } else {
                sendToJs("onSpeechError", "Microphone permission denied.");
            }
        }
    }

    private void launchSpeechIntent(String lang) {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang != null ? lang : "en-IN");
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak now...");

        try {
            startActivityForResult(intent, SPEECH_REQUEST_CODE);
        } catch (Exception e) {
            Log.e(TAG, "Speech Intent failed: " + e.getMessage());
            sendToJs("onSpeechError", "Speech recognition not available on this device.");
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == SPEECH_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                ArrayList<String> results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (results != null && !results.isEmpty()) {
                    sendToJs("onSpeechResults", results.get(0));
                }
            } else {
                sendToJs("onSpeechEnded", "");
            }
        }
    }

    private void sendToJs(String functionName, String data) {
        runOnUiThread(() -> {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                webView.evaluateJavascript("if(window." + functionName + ") { window." + functionName + "('" + data.replace("'", "\\'") + "'); }", null);
            }
        });
    }

    public class AndroidSpeechInterface {
        @JavascriptInterface
        public void startListening(final String lang) {
            runOnUiThread(() -> {
                currentRequestedLang = lang;
                if (!hasMicPermission()) {
                    requestMicPermission();
                } else {
                    launchSpeechIntent(lang);
                }
            });
        }

        @JavascriptInterface
        public void stopListening() {
        }
    }

    @Override
    public void onBackPressed() {
        WebView webView = bridge.getWebView();
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
