import 'dart:ui' as ui;

bool isTablet() {
  bool isTablet;
  final double devicePixelRatio = ui.window.devicePixelRatio;
  final ui.Size size = ui.window.physicalSize;
  final double width = size.width;
  final double height = size.height;

  if (devicePixelRatio < 2 && (width >= 1000 || height >= 1000)) {
    isTablet = true;
  } else if (devicePixelRatio == 2 && (width >= 1920 || height >= 1920)) {
    isTablet = true;
  } else {
    isTablet = false;
  }
  return isTablet;
}

extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${substring(1).toLowerCase()}";
  }
}
