package com.sellby.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private SpeechRecognizer speechRecognizer;
    private Intent speechRecognizerIntent;
    private boolean isListening = false;
    private String currentRequestedLang = "en-IN";
    private static final String TAG = "SELLBY_NATIVE_SPEECH";
    private static final int MIC_PERMISSION_REQUEST_CODE = 1001;

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
                Log.d(TAG, "Permission granted, starting speech recognizer...");
                startListeningInternal(currentRequestedLang);
            } else {
                Log.e(TAG, "Permission denied");
                sendToJs("onSpeechError", "Microphone permission denied (Error 9)");
            }
        }
    }

    private void initSpeechRecognizer() {
        if (speechRecognizer != null) return;

        runOnUiThread(() -> {
            if (!SpeechRecognizer.isRecognitionAvailable(this)) {
                Log.e(TAG, "Speech recognition not available");
                sendToJs("onSpeechError", "Speech recognition service not found. Please install Google Speech Services.");
                return;
            }

            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
            speechRecognizerIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            speechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            speechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            speechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
            
            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override
                public void onReadyForSpeech(Bundle params) {
                    Log.d(TAG, "onReadyForSpeech");
                    sendToJs("onSpeechReady", "");
                }

                @Override
                public void onBeginningOfSpeech() {
                    Log.d(TAG, "onBeginningOfSpeech");
                    sendToJs("onSpeechStarted", "");
                }

                @Override
                public void onRmsChanged(float rmsdB) {}

                @Override
                public void onBufferReceived(byte[] buffer) {}

                @Override
                public void onEndOfSpeech() {
                    Log.d(TAG, "onEndOfSpeech");
                    isListening = false;
                    sendToJs("onSpeechEnded", "");
                }

                @Override
                public void onError(int error) {
                    isListening = false;
                    
                    // Handle Error 13 (Language Unavailable)
                    if (error == 13 && !currentRequestedLang.equals("en-IN")) {
                        Log.w(TAG, "Lang " + currentRequestedLang + " unavailable. Retrying in English.");
                        currentRequestedLang = "en-IN";
                        runOnUiThread(() -> startListeningInternal(currentRequestedLang));
                        return;
                    }

                    String message;
                    switch (error) {
                        case SpeechRecognizer.ERROR_AUDIO: message = "Audio error (3)"; break;
                        case SpeechRecognizer.ERROR_CLIENT: message = "Internal client error (5)"; break;
                        case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: message = "Microphone permission missing (9)"; break;
                        case SpeechRecognizer.ERROR_NETWORK: message = "Network error (2)"; break;
                        case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: message = "Network timeout (1)"; break;
                        case SpeechRecognizer.ERROR_NO_MATCH: message = "No match found (7)"; break;
                        case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: 
                            message = "Service busy (8). Please wait...";
                            runOnUiThread(() -> { if(speechRecognizer != null) speechRecognizer.cancel(); });
                            break;
                        case SpeechRecognizer.ERROR_SERVER: message = "Server error (4)"; break;
                        case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: message = "No speech input (6)"; break;
                        default: message = "Error " + error; break;
                    }
                    Log.e(TAG, "onError: " + message);
                    sendToJs("onSpeechError", message);
                }

                @Override
                public void onResults(Bundle results) {
                    isListening = false;
                    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty()) {
                        Log.d(TAG, "onResults: " + matches.get(0));
                        sendToJs("onSpeechResults", matches.get(0));
                    }
                }

                @Override
                public void onPartialResults(Bundle partialResults) {
                    ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty()) {
                        sendToJs("onSpeechPartialResults", matches.get(0));
                    }
                }

                @Override
                public void onEvent(int eventType, Bundle params) {}
            });
        });
    }

    private void startListeningInternal(String lang) {
        if (!hasMicPermission()) {
            currentRequestedLang = lang;
            requestMicPermission();
            return;
        }

        initSpeechRecognizer();
        
        if (speechRecognizer != null) {
            isListening = true;
            currentRequestedLang = (lang != null && !lang.isEmpty()) ? lang : "en-IN";
            speechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, currentRequestedLang);
            speechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, currentRequestedLang);
            speechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, currentRequestedLang);
            
            speechRecognizer.startListening(speechRecognizerIntent);
            Log.d(TAG, "Native recognition started for: " + currentRequestedLang);
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
            runOnUiThread(() -> startListeningInternal(lang));
        }

        @JavascriptInterface
        public void stopListening() {
            runOnUiThread(() -> {
                if (speechRecognizer != null) {
                    speechRecognizer.stopListening();
                }
                isListening = false;
            });
        }
    }

    @Override
    public void onDestroy() {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }
        super.onDestroy();
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
