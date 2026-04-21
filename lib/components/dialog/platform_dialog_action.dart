import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:pop/platform_widget/platform_widget.dart';

class PlatformDialogAction extends PlatformWidget {
  const PlatformDialogAction(
      {Key? key, required this.child, required this.onPressed})
      : super(key: key);
  final Widget child;
  final VoidCallback onPressed;

  @override
  TextButton buildMaterialWidget(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      child: child,
    );
  }

  @override
  CupertinoDialogAction buildCupertinoWidget(BuildContext context) {
    return CupertinoDialogAction(
      onPressed: onPressed,
      child: child,
    );
  }
}
