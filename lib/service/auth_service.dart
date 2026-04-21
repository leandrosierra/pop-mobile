import 'package:flutter/material.dart';
import 'package:pop/model/pop_app_user.dart';
import 'package:pop/service/impl/social_auth_service.dart';

abstract class AuthService {
  Future<PopAppUser?> getCurrentSignedInUser({bool force = false});

  Future<PopAppUser?> signinWithEmail(String email, String password);

  void signout();

  Future<bool> deleteAccount();

  void setCurrentUser(PopAppUser user);

  Future<String> getCurrentUserAccessToken();

  //Future<PopAppUser?> signInWithGoogle({required BuildContext context});

  Future<PopAppUser?> signInUser(
      {required BuildContext context, required AuthProvider provider});

  Future<void> createEmailAccount(String name, String email);

  Future<void> forgotPasswordRequest(String email);

  Future<bool> isEmailUser();
}
