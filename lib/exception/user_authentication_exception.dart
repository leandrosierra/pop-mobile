class UserAuthenticationException implements Exception {
  String cause;
  UserAuthenticationException(this.cause);
}
