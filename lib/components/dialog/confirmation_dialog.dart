import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:pop/components/dialog/platform_dialog_action.dart';
import 'package:pop/platform_widget/platform_widget.dart';

class ConfirmationDialog extends PlatformWidget {
  final String title;
  final String content;
  final String cancelText;
  final String confirmText;

  const ConfirmationDialog(
      {Key? key,
      this.title = "Confirmation Required",
      required this.content,
      required this.cancelText,
      required this.confirmText})
      : super(key: key);

  @override
  Widget buildCupertinoWidget(BuildContext context) {
    return CupertinoAlertDialog(
      title: Text(title),
      content: Text(content),
      actions: _actions(context, cancelText, confirmText),
    );
  }

  @override
  Widget buildMaterialWidget(BuildContext context) {
    return AlertDialog(
      title: Text(title),
      content: Text(content),
      actions: _actions(
          context, cancelText.toUpperCase(), confirmText.toUpperCase()),
    );
  }

  List<Widget> _actions(
      BuildContext context, String cancelText, String confirmText) {
    var onSelect = PlatformDialogAction(
      child: Text(cancelText),
      onPressed: () => _dismiss(context, false),
    );
    var onDismiss = PlatformDialogAction(
      child: Text(confirmText),
      onPressed: () => _dismiss(context, true),
    );
    var actions = <Widget>[onSelect, onDismiss];
    return actions;
  }

  Future<bool> show(BuildContext context) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: !Platform.isIOS,
      builder: (context) => this,
    );
    return Future.value(result ?? false);
  }

  void _dismiss(BuildContext context, bool value) {
    Navigator.of(context, rootNavigator: true).pop(value);
  }
}
