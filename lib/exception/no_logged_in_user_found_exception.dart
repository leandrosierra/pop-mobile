class NoLoggedInUserFoundException implements Exception {
  String cause;
  NoLoggedInUserFoundException(this.cause);
}
