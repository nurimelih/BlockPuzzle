import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import EXUpdates

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    self.launchOptions = launchOptions

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    #if DEBUG
    AppController.initializeWithoutStarting()
    startReactNative()
    #else
    AppController.initializeWithoutStarting()
    let updatesController = AppController.sharedInstance
    updatesController.delegate = delegate
    updatesController.start()
    #endif

    return true
  }

  func startReactNative() {
    guard let factory = reactNativeFactory, let window = window else { return }
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions
    )
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate, AppControllerDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    AppController.sharedInstance.launchAssetUrl()
      ?? Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }

  // expo-updates: update check tamamlandığında çağrılır, sonra React başlatılır
  func appController(
    _ appController: AppControllerInterface,
    didStartWithSuccess success: Bool
  ) {
    DispatchQueue.main.async {
      guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
      appDelegate.startReactNative()
    }
  }
}
