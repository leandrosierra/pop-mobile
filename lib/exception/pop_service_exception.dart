class PopServiceException implements Exception {
  String cause;
  PopServiceException(this.cause);
  @override
  String toString() {
    return cause;
  }
}
