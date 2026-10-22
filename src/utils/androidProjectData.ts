import { AndroidProjectCodeFile } from '../types';

export const ANDROID_PROJECT_FILES: AndroidProjectCodeFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    category: 'manifest',
    description: 'Android Manifest with strictly required permissions for Voice, Camera, Torch, Calls, SMS and AccessibilityService',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.yasmin.ai">

    <!-- Network permissions for Gemini AI API calls -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Voice activation & Speech recognition -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- Phone Controls (Requested with runtime permission + user confirmation) -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />

    <!-- Torch / Flashlight control -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera.flash" android:required="false" />

    <!-- Background Voice Assistant Service (Android 14+ compliant) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.YasminAI"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.YasminAI"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Foreground Service for background voice listening -->
        <service
            android:name=".YasminForegroundService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="microphone" />

        <!-- Accessibility Service for automated tap, swipe, and scroll control -->
        <service
            android:name=".YasminAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

    </application>
</manifest>`
  },
  {
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    filename: 'accessibility_service_config.xml',
    category: 'resource',
    description: 'Accessibility Service configuration for screen interaction, touch injection and scrolling',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagReportViewIds"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="100"
    android:canRetrieveWindowContent="true"
    android:canPerformGestures="true"
    android:settingsActivity="com.yasmin.ai.MainActivity" />`
  },
  {
    path: 'app/src/main/java/com/yasmin/ai/YasminAccessibilityService.kt',
    filename: 'YasminAccessibilityService.kt',
    category: 'kotlin',
    description: 'Real Accessibility Service implementing screen tap, scroll, swipe, and navigation gestures',
    content: `package com.yasmin.ai

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * YasminAccessibilityService allows Yasmin to navigate apps, scroll through feeds,
 * tap on buttons by text or position, and press system keys (Back, Home, Recents).
 */
class YasminAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "YasminAccessibility"
        var instance: YasminAccessibilityService? = null
            private set

        val isServiceActive: Boolean
            get() = instance != null
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.i(TAG, "Yasmin Accessibility Service Connected successfully.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Monitors window changes for proactive assistance when requested
    }

    override fun onInterrupt() {
        Log.w(TAG, "Yasmin Accessibility Service Interrupted.")
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    /**
     * Smooth gesture scrolling (up or down)
     */
    fun performScroll(direction: String): Boolean {
        val rootNode = rootInActiveWindow
        if (rootNode != null) {
            val action = if (direction.equals("down", ignoreCase = true)) {
                AccessibilityNodeInfo.ACTION_SCROLL_FORWARD
            } else {
                AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD
            }
            if (rootNode.performAction(action)) {
                return true
            }
        }

        // Fallback to gesture-based swipe if node action is not consumed
        val displayMetrics = resources.displayMetrics
        val centerX = displayMetrics.widthPixels / 2f
        val startY = if (direction.equals("down", ignoreCase = true)) displayMetrics.heightPixels * 0.75f else displayMetrics.heightPixels * 0.25f
        val endY = if (direction.equals("down", ignoreCase = true)) displayMetrics.heightPixels * 0.25f else displayMetrics.heightPixels * 0.75f

        val path = Path().apply {
            moveTo(centerX, startY)
            lineTo(centerX, endY)
        }

        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 350))
            .build()

        return dispatchGesture(gesture, null, null)
    }

    /**
     * Tap on a screen button containing target text
     */
    fun tapByText(targetText: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val matchingNodes = rootNode.findAccessibilityNodeInfosByText(targetText)
        for (node in matchingNodes) {
            if (node.isClickable && node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
                return true
            }
            // Check parent if child node is not directly clickable
            var parent = node.parent
            while (parent != null) {
                if (parent.isClickable && parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
                    return true
                }
                parent = parent.parent
            }
        }
        return false
    }

    /**
     * Dispatch system navigation actions
     */
    fun pressHome() = performGlobalAction(GLOBAL_ACTION_HOME)
    fun pressBack() = performGlobalAction(GLOBAL_ACTION_BACK)
    fun openRecents() = performGlobalAction(GLOBAL_ACTION_RECENTS)
    fun openNotifications() = performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)
}`
  },
  {
    path: 'app/src/main/java/com/yasmin/ai/PhoneController.kt',
    filename: 'PhoneController.kt',
    category: 'kotlin',
    description: 'Hardware and OS integrations: App launch, YouTube search, Torch, Volume, Call and SMS with safety confirmation',
    content: `package com.yasmin.ai

import android.content.Context
import android.content.Intent
import android.hardware.camera2.CameraManager
import android.media.AudioManager
import android.net.Uri
import android.os.BatteryManager
import android.widget.Toast

object PhoneController {

    /**
     * Open an installed app by query or package name
     */
    fun openApp(context: Context, appName: String): Boolean {
        val packageMap = mapOf(
            "youtube" to "com.google.android.youtube",
            "whatsapp" to "com.whatsapp",
            "camera" to "com.android.camera",
            "settings" to "com.android.settings",
            "chrome" to "com.android.chrome",
            "maps" to "com.google.android.apps.maps",
            "calculator" to "com.google.android.calculator",
            "clock" to "com.google.android.deskclock"
        )

        val targetPackage = packageMap[appName.lowercase().trim()]
        if (targetPackage != null) {
            val intent = context.packageManager.getLaunchIntentForPackage(targetPackage)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                return true
            }
        }

        // Generic search for package
        try {
            val pm = context.packageManager
            val packages = pm.getInstalledApplications(0)
            for (app in packages) {
                val label = pm.getApplicationLabel(app).toString()
                if (label.contains(appName, ignoreCase = true)) {
                    val intent = pm.getLaunchIntentForPackage(app.packageName)
                    if (intent != null) {
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        context.startActivity(intent)
                        return true
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return false
    }

    /**
     * Search and play songs or videos on YouTube
     */
    fun searchYouTube(context: Context, query: String) {
        val appIntent = Intent(Intent.ACTION_SEARCH).apply {
            setPackage("com.google.android.youtube")
            putExtra("query", query)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        try {
            context.startActivity(appIntent)
        } catch (e: Exception) {
            // Fallback to web browser intent
            val webIntent = Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://www.youtube.com/results?search_query=\${Uri.encode(query)}")
            ).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(webIntent)
        }
    }

    /**
     * Torch / Flashlight toggle via CameraManager
     */
    fun toggleTorch(context: Context, enable: Boolean): Boolean {
        return try {
            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val cameraId = cameraManager.cameraIdList[0]
            cameraManager.setTorchMode(cameraId, enable)
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * Adjust media volume level (0 to 100)
     */
    fun setVolume(context: Context, percentage: Int): Boolean {
        return try {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
            val targetVolume = (maxVolume * (percentage.coerceIn(0, 100) / 100f)).toInt()
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVolume, AudioManager.FLAG_SHOW_UI)
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Get current battery percentage and charging state
     */
    fun getBatteryInfo(context: Context): Pair<Int, Boolean> {
        val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        val isCharging = bm.isCharging
        return Pair(level, isCharging)
    }

    /**
     * Prepare Phone Call with confirmation
     */
    fun prepareCallIntent(phoneNumber: String): Intent {
        return Intent(Intent.ACTION_CALL, Uri.parse("tel:\$phoneNumber")).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
    }

    /**
     * Prepare SMS send with confirmation
     */
    fun prepareSmsIntent(phoneNumber: String, message: String): Intent {
        return Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:\$phoneNumber")).apply {
            putExtra("sms_body", message)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/yasmin/ai/VoiceManager.kt',
    filename: 'VoiceManager.kt',
    category: 'kotlin',
    description: 'Speech recognition (Hindi hi-IN) and Text-To-Speech with feminine pitch calibration',
    content: `package com.yasmin.ai

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale

class VoiceManager(
    private val context: Context,
    private val onResult: (String) -> Unit,
    private val onListeningStateChanged: (Boolean) -> Unit
) : TextToSpeech.OnInitListener {

    private var speechRecognizer: SpeechRecognizer? = null
    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    init {
        tts = TextToSpeech(context, this)
        initSpeechRecognizer()
    }

    private fun initSpeechRecognizer() {
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    onListeningStateChanged(true)
                }

                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {
                    onListeningStateChanged(false)
                }

                override fun onError(error: Int) {
                    onListeningStateChanged(false)
                }

                override fun onResults(results: Bundle?) {
                    onListeningStateChanged(false)
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        onResult(matches[0])
                    }
                }

                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val hindiLocale = Locale("hi", "IN")
            val result = tts?.setLanguage(hindiLocale)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                // Fallback to default Indian English if Hindi voice packet is missing
                tts?.setLanguage(Locale("en", "IN"))
            }
            // Calibrate sweet, feminine girlfriend voice pitch & pace
            tts?.setPitch(1.15f)
            tts?.setSpeechRate(0.96f)
            isTtsReady = true
        }
    }

    fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "यास्मीन सुन रही है... बोलिए")
        }
        speechRecognizer?.startListening(intent)
    }

    fun stopListening() {
        speechRecognizer?.stopListening()
        onListeningStateChanged(false)
    }

    fun speak(text: String, onComplete: (() -> Unit)? = null) {
        if (isTtsReady && tts != null) {
            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {}
                override fun onDone(utteranceId: String?) {
                    onComplete?.invoke()
                }
                override fun onError(utteranceId: String?) {}
            })
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "yasmin_utterance")
        }
    }

    fun destroy() {
        speechRecognizer?.destroy()
        tts?.stop()
        tts?.shutdown()
    }
}`
  },
  {
    path: 'app/src/main/java/com/yasmin/ai/GeminiBrainRepository.kt',
    filename: 'GeminiBrainRepository.kt',
    category: 'kotlin',
    description: 'Kotlin client communicating with Gemini API for chat, emotional mood, and structured intent handling',
    content: `package com.yasmin.ai

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class GeminiBrainRepository(private val backendUrl: String) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    suspend fun queryYasmin(
        userMessage: String,
        userNickname: String = "जानू"
    ): Result<YasminResponse> = withContext(Dispatchers.IO) {
        try {
            val payload = JSONObject().apply {
                put("message", userMessage)
                put("userNickname", userNickname)
            }

            val request = Request.Builder()
                .url("\$backendUrl/api/gemini/chat")
                .header("User-Agent", "aistudio-build")
                .post(payload.toString().toRequestBody("application/json".toMediaType()))
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("HTTP \${response.code}: \$body"))
            }

            val json = JSONObject(body)
            val data = json.getJSONObject("data")
            val replyText = data.getString("replyText")
            val mood = data.optString("mood", "loving")
            val actionObj = data.optJSONObject("action")

            val actionType = actionObj?.optString("type", "NONE") ?: "NONE"
            val actionDesc = actionObj?.optString("description", "") ?: ""
            val paramsObj = actionObj?.optJSONObject("params")

            val paramsMap = mutableMapOf<String, Any>()
            paramsObj?.keys()?.forEach { key ->
                paramsMap[key] = paramsObj.get(key)
            }

            Result.success(
                YasminResponse(
                    replyText = replyText,
                    mood = mood,
                    actionType = actionType,
                    actionDescription = actionDesc,
                    actionParams = paramsMap
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

data class YasminResponse(
    val replyText: String,
    val mood: String,
    val actionType: String,
    val actionDescription: String,
    val actionParams: Map<String, Any>
)`
  },
  {
    path: 'app/src/main/java/com/yasmin/ai/YasminForegroundService.kt',
    filename: 'YasminForegroundService.kt',
    category: 'kotlin',
    description: 'Foreground Service maintaining ongoing notification and persistent voice activation',
    content: `package com.yasmin.ai

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class YasminForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "yasmin_assistant_channel"
        const val NOTIFICATION_ID = 1001
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("यास्मीन एआई सक्रिय है 🌸")
            .setContentText("आपकी प्यारी असिस्टेंट आपकी बात सुनने के लिए तैयार है")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Yasmin Voice Assistant Channel",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Foreground service for continuous voice assistant standby"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
}`
  },
  {
    path: 'app/build.gradle',
    filename: 'app/build.gradle (Groovy DSL - Recommended)',
    category: 'gradle',
    description: 'App Module build.gradle for standard Android Studio setups with Android 14 (API 34), OkHttp and Coroutines',
    content: `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.yasmin.ai'
    compileSdk 34

    defaultConfig {
        applicationId "com.yasmin.ai"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary true
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }

    buildFeatures {
        viewBinding true
    }
}

dependencies {
    // AndroidX & Core UI
    implementation 'androidx.core:core-ktx:1.13.1'
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'com.google.android.material:material:1.12.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.8.2'

    // Networking for Gemini AI Brain API
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'

    // Kotlin Coroutines for async execution
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1'
}`
  },
  {
    path: 'build.gradle',
    filename: 'build.gradle (Project Root - Groovy)',
    category: 'gradle',
    description: 'Root project build.gradle configuration with Gradle 8.3+ & Kotlin 1.9.23 plugins',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    ext.kotlin_version = '1.9.23'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.3.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}`
  },
  {
    path: 'app/build.gradle.kts',
    filename: 'app/build.gradle.kts (Kotlin DSL)',
    category: 'gradle',
    description: 'App-level Kotlin DSL Gradle configuration for modern Android Studio setups',
    content: `plugins {
    id("com.android.application") version "8.3.2"
    id("org.jetbrains.kotlin.android") version "1.9.23"
}

android {
    namespace = "com.yasmin.ai"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.yasmin.ai"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.2")

    // Networking for Gemini API calls
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}`
  },
  {
    path: 'build.gradle.kts',
    filename: 'build.gradle.kts (Project Root - Kotlin DSL)',
    category: 'gradle',
    description: 'Root Gradle configuration for Android Studio using Kotlin DSL',
    content: `plugins {
    id("com.android.application") version "8.3.2" apply false
    id("com.android.library") version "8.3.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.23" apply false
}`
  },
  {
    path: 'gradle.properties',
    filename: 'gradle.properties',
    category: 'gradle',
    description: 'Project-wide JVM arguments and AndroidX build optimization properties',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official`
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    filename: 'gradle-wrapper.properties',
    category: 'gradle',
    description: 'Gradle Wrapper configuration with Gradle 8.4',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`
  },
  {
    path: 'settings.gradle',
    filename: 'settings.gradle',
    category: 'gradle',
    description: 'Repository settings for Google Maven and Maven Central',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "YasminAI"
include ':app'`
  },
  {
    path: 'settings.gradle.kts',
    filename: 'settings.gradle.kts',
    category: 'gradle',
    description: 'Kotlin DSL repository settings',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "YasminAI"
include(":app")`
  },
  {
    path: 'README.md',
    filename: 'README.md (Build & Install Guide)',
    category: 'doc',
    description: 'Step-by-step instructions for Android Studio compilation, APK generation, and setting up AccessibilityService permissions',
    content: `# Yasmin AI – Android Studio Build & Installation Guide 🌸

## 1. Requirements
- **Android Studio Jellyfish | Iguana | Koala** or newer.
- **JDK 17** (bundled with Android Studio).
- Android Device running **Android 8.0 (API 26) to Android 14 (API 34)**.

## 2. Steps to Build the APK
1. Download or extract the project folder.
2. In Android Studio, select **File -> Open...** and choose this project directory.
3. Allow Gradle to sync dependencies automatically.
4. Set your Backend Server URL in \`MainActivity.kt\` or connect it directly to your deployed Yasmin AI web service.
5. In the Android Studio terminal or command prompt, run:
   \`\`\`bash
   ./gradlew assembleDebug
   \`\`\`
   On Windows PowerShell:
   \`\`\`powershell
   .\\gradlew.bat assembleDebug
   \`\`\`
6. The generated APK file will be located at:
   \`app/build/outputs/apk/debug/app-debug.apk\`

## 3. Installation on Phone
1. Transfer the \`app-debug.apk\` file to your Android phone via USB, Google Drive, or WhatsApp.
2. On your phone, tap the APK and tap **Install**. (Enable "Install from Unknown Sources" if prompted).
3. Open **Yasmin AI**.

## 4. Activating Phone Control & Accessibility
1. **Accessibility Permission (Crucial for screen taps, scroll, and auto navigation):**
   - Go to Phone **Settings -> Accessibility -> Downloaded Apps / Installed Services**.
   - Tap **Yasmin AI** and switch the toggle **ON**.
2. **Microphone & Overlay Permissions:**
   - Grant Audio permission for Hindi speech recognition.
   - Allow "Display over other apps" for the floating voice assistant orb.
3. **Sensitive Actions Safety:**
   - Yasmin will always ask your confirmation before executing phone calls or sending messages.`
  }
];
