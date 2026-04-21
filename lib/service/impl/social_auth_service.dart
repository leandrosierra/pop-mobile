import 'dart:async';
import 'dart:convert' as convert;
import 'dart:io';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:pop/constants.dart';
import 'package:pop/exception/pop_service_exception.dart';
import 'package:pop/exception/user_authentication_exception.dart';
import 'package:pop/model/pop_app_user.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../auth_service.dart';

class SocialAuthService extends AuthService {
  PopAppUser? _currentSignedInUser;
  final _storage = const FlutterSecureStorage();
  final emailAuthJwtKey = 'emailAuthJwt';
  final emailAuthRefreshTokenKey = 'emailAuthRefreshToken';

  @override
  Future<PopAppUser?> getCurrentSignedInUser({bool force = false}) async {
    if (_currentSignedInUser == null || force) {
      PopAppUser? emailUser = await loadEmailUserIfPresent();
      if (emailUser != null) {
        return emailUser;
      }

      var user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        return null;
      }
      String? jwt = await user.getIdToken();
      if (jwt == null) {
        return null;
      }
      _currentSignedInUser = await _getCurrentUser(jwt);
      return _currentSignedInUser;
    } else {
      return _currentSignedInUser;
    }
  }

  @override
  Future<String> getCurrentUserAccessToken() async {
    String? jwt = await _storage.read(key: emailAuthJwtKey);
    if (jwt != null) {
      return jwt;
    } else {
      var user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        throw UserAuthenticationException('User not authenticated');
      }
      return user.getIdToken().then((token) {
        if (token == null) {
          throw UserAuthenticationException(
              'Unable to authenticate user. please try again later');
        }
        return token;
      });
    }
  }

  @override
  void setCurrentUser(PopAppUser user) {
    _currentSignedInUser = user;
  }

  @override
  void signout() async {
    await clearStorage();
    final GoogleSignIn googleSignIn = GoogleSignIn();
    await googleSignIn.disconnect();
    await FirebaseAuth.instance.signOut();
    _currentSignedInUser = null;
  }

  @override
  Future<PopAppUser?> signInUser(
      {required BuildContext context, required AuthProvider provider}) async {
    PopAppUser? popAppUser;
    if (provider == AuthProvider.google) {
      User? user = await _signInWithGoogle(context);
      if (user != null) {
        String? jwt = await FirebaseAuth.instance.currentUser!.getIdToken();
        return await _getCurrentUser(jwt);
      }
    } else if (provider == AuthProvider.facebook) {
      User? user = await _signInWithFacebook(context);
      if (user != null) {
        String? jwt = await FirebaseAuth.instance.currentUser!.getIdToken();
        return await _getCurrentUser(jwt);
      }
    } else if (provider == AuthProvider.apple) {
      User? user = await _signInWithApple();
      if (user != null) {
        String? jwt = await FirebaseAuth.instance.currentUser!.getIdToken();
        return await _getCurrentUser(jwt);
      }
    }

    return popAppUser;
  }

  @override
  Future<bool> deleteAccount() async {
    var url = Uri.https(popapiurl, '/pop/user/current');
    var jwt = await getCurrentUserAccessToken();
    var request = http.Request('DELETE', url);
    print(jwt.substring(0, 700));
    print(jwt.substring(700));
    var headers = {
      HttpHeaders.authorizationHeader: 'Bearer $jwt',
      HttpHeaders.contentTypeHeader: 'application/json'
    };
    request.headers.addAll(headers);

    http.StreamedResponse response = await request.send();
    if (response.statusCode == 200) {
      FirebaseAuth.instance.currentUser?.delete();
      await FirebaseAuth.instance.signOut();
      return true;
    } else {
      throw PopServiceException("Unable to serve request.");
    }
  }

  //PRIVATE

  Future<User?> _signInWithGoogle(BuildContext context) async {
    var auth = FirebaseAuth.instance;
    // if (googleSignInAccount != null) {
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      final GoogleSignInAccount? googleSignInAccount =
          await googleSignIn.signIn();
      if (googleSignInAccount != null) {
        final GoogleSignInAuthentication googleSignInAuthentication =
            await googleSignInAccount.authentication;

        final AuthCredential credential = GoogleAuthProvider.credential(
          accessToken: googleSignInAuthentication.accessToken,
          idToken: googleSignInAuthentication.idToken,
        );

        final UserCredential userCredential =
            await auth.signInWithCredential(credential);
        return userCredential.user;
      }
    } on FirebaseAuthException catch (e) {
      if (e.code == 'account-exists-with-different-credential') {
        throw UserAuthenticationException(
            "Un compte existe déjà avec la même adresse e-mail mais un fournisseur différent. Essayez de vous connecter en utilisant un fournisseur associé à cette adresse e-mail.");
      } else if (e.code == 'invalid-credential') {
        throw UserAuthenticationException(
            "Impossible de se connecter à Google. Veuillez vérifier vos informations d'identification.");
      }
    } catch (e) {
      throw UserAuthenticationException(
          "Impossible de connecter cet utilisateur with Google. Veuillez réessayer plus tard.");
    }
    return null;
  }

  //}

  Future<User?> _signInWithFacebook(BuildContext context) async {
    var auth = FirebaseAuth.instance;
    User? user;
    LoginResult? loginResult;
    try {
      loginResult = await FacebookAuth.instance.login(permissions: ['email']);
    } catch (e) {
      var snackBar = const SnackBar(
          content: Text(
              "Impossible de se connecter à Facebook. Veuillez réessayer plus tard."));
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
    }

    if (loginResult != null && loginResult.accessToken != null) {
      try {
        final OAuthCredential facebookAuthCredential =
            FacebookAuthProvider.credential(loginResult.accessToken!.token);
        final UserCredential userCredential =
            await auth.signInWithCredential(facebookAuthCredential);
        user = userCredential.user;
      } on FirebaseAuthException catch (e) {
        if (e.code == 'account-exists-with-different-credential') {
          throw UserAuthenticationException(
              "Un compte existe déjà avec la même adresse e-mail mais un fournisseur différent. Essayez de vous connecter en utilisant un fournisseur associé à cette adresse e-mail.");
        } else if (e.code == 'invalid-credential') {
          throw UserAuthenticationException(
              "Impossible de se connecter à Facebook. Veuillez vérifier vos informations d'identification.");
        }
      } on Exception catch (e) {
        throw UserAuthenticationException(
            "Impossible de connecter cet utilisateur with Facebook. Veuillez réessayer plus tard.");
      }
    }
    return user;
  }

  String _generateNonce([int length = 32]) {
    const charset =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(length, (_) => charset[random.nextInt(charset.length)])
        .join();
  }

  String _sha256ofString(String input) {
    final bytes = convert.utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  Future<User?> _signInWithApple() async {
    final rawNonce = _generateNonce();
    final nonce = _sha256ofString(rawNonce);
    try {
      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        nonce: nonce,
      );
      final oauthCredential = OAuthProvider("apple.com").credential(
        idToken: appleCredential.identityToken,
        rawNonce: rawNonce,
      );
      UserCredential userCredential =
          await FirebaseAuth.instance.signInWithCredential(oauthCredential);
      return userCredential.user;
    } on Exception catch (e) {
      throw UserAuthenticationException(
          "Impossible de connecter cet utilisateur with Apple. Veuillez réessayer plus tard.");
    }
  }

  Future<PopAppUser> _getCurrentUser(String? jwt) async {
    if (jwt == null) {
      throw PopServiceException(
          "Impossible de connecter l'utilisateur, veuillez réessayer plus tard");
    }
    var url = Uri.https(popapiurl, '/pop/user/current');
    var response = await http
        .get(url, headers: {HttpHeaders.authorizationHeader: 'Bearer $jwt'});
    if (response.statusCode == 200) {
      var jsonResponse = convert.jsonDecode(
              const convert.Utf8Decoder().convert(response.bodyBytes))
          as Map<String, dynamic>;
      return PopAppUser.fromMap(jsonResponse);
    } else {
      throw PopServiceException(
          "Impossible de connecter l'utilisateur, veuillez réessayer plus tard");
    }
  }

  @override
  Future<PopAppUser?> signinWithEmail(String email, String password) async {
    var url = Uri.https(popapiurl, '/pop/user/email-login');
    var headers = {HttpHeaders.contentTypeHeader: 'application/json'};
    final response = await http.post(
      url,
      headers: headers,
      body: convert
          .jsonEncode(<String, String>{'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      Map<String, dynamic> json = convert.jsonDecode(response.body);
      if (json.containsKey("token")) {
        var storage = const FlutterSecureStorage();

        await storage.write(key: emailAuthJwtKey, value: json['token']);
        await storage.write(
            key: emailAuthRefreshTokenKey, value: json['refreshToken']);
        return _getCurrentUser(json['token']);
      } else {
        throw PopServiceException(
            'Unable to serve your request. Please try later');
      }
    } else if (response.statusCode == 403) {
      throw PopServiceException('Incorrect email ID/password.');
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }

  Future<PopAppUser?> loadEmailUserIfPresent() async {
    bool containeJwt = await _storage.containsKey(key: emailAuthJwtKey);
    if (containeJwt) {
      String? jwt = await _storage.read(key: emailAuthJwtKey);
      if (jwt != null) {
        return _getCurrentUser(jwt).then((value) {
          return value;
        }).catchError((err) async {
          var newToken = await refreshJWtToken();
          return await _getCurrentUser(newToken);
        });
      }
    }
    return null;
  }

  Future<String> refreshJWtToken() async {
    String? refreshToken = await _storage.read(key: emailAuthRefreshTokenKey);

    if (refreshToken == null) {
      throw PopServiceException('Unable to login. Please try again.');
    }
    var url = Uri.https(popapiurl, '/pop/user/refresh-token');
    var headers = {HttpHeaders.contentTypeHeader: 'application/json'};
    final response = await http.post(
      url,
      headers: headers,
      body: convert.jsonEncode(<String, String>{'refreshToken': refreshToken}),
    );

    if (response.statusCode == 200) {
      var jsonResponse = convert.jsonDecode(
              const convert.Utf8Decoder().convert(response.bodyBytes))
          as Map<String, dynamic>;
      await _storage.write(
          key: emailAuthJwtKey, value: jsonResponse['accessToken']);
      await _storage.write(
          key: emailAuthRefreshTokenKey, value: jsonResponse['refreshToken']);
      return jsonResponse['accessToken'];
    } else {
      await clearStorage();
      throw PopServiceException('Unable to login. Please try again.');
    }
  }

  Future<void> clearStorage() async {
    await _storage.delete(key: emailAuthRefreshTokenKey);
    await _storage.delete(key: emailAuthJwtKey);
  }

  @override
  Future<void> createEmailAccount(String name, String email) async {
    var url = Uri.https(popapiurl, '/pop/user/email-signup');
    var headers = {HttpHeaders.contentTypeHeader: 'application/json'};
    final response = await http.post(
      url,
      headers: headers,
      body: convert
          .jsonEncode(<String, String>{'emailId': email, 'nickname': name}),
    );
    if (response.statusCode == 201) {
      return;
    } else if (response.statusCode == 403) {
      var jsonResponse = convert.jsonDecode(
              const convert.Utf8Decoder().convert(response.bodyBytes))
          as Map<String, dynamic>;
      if (jsonResponse.containsKey("errors")) {
        throw PopServiceException(jsonResponse['errors'][0]);
      } else {
        throw PopServiceException(
            'Unable to serve your request. Please try later');
      }
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }

  @override
  Future<void> forgotPasswordRequest(String email) async {
    var url = Uri.https(popapiurl, '/pop/user/email-forgot-password');
    var headers = {HttpHeaders.contentTypeHeader: 'application/json'};
    final response = await http.post(
      url,
      headers: headers,
      body: convert.jsonEncode(<String, String>{'mailId': email}),
    );
    if (response.statusCode == 204) {
      return;
    } else if (response.statusCode == 400) {
      var jsonResponse = convert.jsonDecode(
              const convert.Utf8Decoder().convert(response.bodyBytes))
          as Map<String, dynamic>;
      if (jsonResponse.containsKey("errors")) {
        throw PopServiceException(jsonResponse['errors'][0]);
      } else {
        throw PopServiceException(
            'Unable to serve your request. Please try later');
      }
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }

  @override
  Future<bool> isEmailUser() async {
    String? jwt = await _storage.read(key: emailAuthJwtKey);
    return jwt != null;
  }
}

enum AuthProvider { google, facebook, apple }
