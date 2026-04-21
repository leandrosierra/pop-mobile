import 'package:get_it/get_it.dart';
import 'package:pop/service/auth_service.dart';
import 'package:pop/service/impl/social_auth_service.dart';
import 'package:pop/service/pop_admin_service.dart';
import 'package:pop/service/pop_service.dart';

GetIt locator = GetIt.instance;
void setupLocator() {
  locator.registerSingleton<AuthService>(SocialAuthService());
  locator.registerSingleton<PopService>(PopService());
  locator.registerSingleton<PopAdminService>(PopAdminService());
}
