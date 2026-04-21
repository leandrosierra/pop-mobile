import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:pop/screens/splash_screen.dart';
import 'package:pop/service_locator.dart';
import 'package:pop/theme.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  setupLocator();
  runApp(const PopApp());
}

class PopApp extends StatelessWidget {
  const PopApp({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(720, 1280),
      builder: (context, child) => GetMaterialApp(
        title: 'Pop App',
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [Locale('fr', ''), Locale('en', '')],
        debugShowCheckedModeBanner: false,
        theme: popAppThemeData,
        home: SplashScreen(),
        builder: EasyLoading.init(),
      ),
    );
  }
}
