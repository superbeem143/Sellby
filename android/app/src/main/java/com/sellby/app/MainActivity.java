package com.sellby.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SELLBY_NATIVE_SPEECH";
    private static final int MIC_PERMISSION_REQUEST_CODE = 1001;
    private static final int SPEECH_REQUEST_CODE = 1002;
    private String currentRequestedLang = "en-IN";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        WebView webView = bridge.getWebView();
        if (webView != null) {
            webView.addJavascriptInterface(new AndroidSpeechInterface(), "AndroidSpeech");
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
            // Not needed for Intent-based speech as system handles it
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
