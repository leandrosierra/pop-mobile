import 'package:flutter/material.dart';
import 'dart:math' as math;

class PopAppAnimatedIcon extends StatefulWidget {
  const PopAppAnimatedIcon({
    super.key,
    required this.startIcon,
    required this.endIcon,
    required this.onStartIconPress,
    required this.onEndIconPress,
    this.size,
    required this.controller,
    this.startIconColor,
    this.endIconColor,
    this.duration,
    this.clockwise,
    this.startTooltip,
    this.endTooltip,
  });
  final IconData startIcon, endIcon;
  final bool Function() onStartIconPress, onEndIconPress;
  final Duration? duration;
  final bool? clockwise;
  final double? size;
  final Color? startIconColor, endIconColor;
  final AnimateIconController controller;
  final String? startTooltip, endTooltip;

  @override
  _PopAppAnimatedIconState createState() => _PopAppAnimatedIconState();
}

class _PopAppAnimatedIconState extends State<PopAppAnimatedIcon>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration ?? const Duration(seconds: 1),
      lowerBound: 0.0,
      upperBound: 1.0,
    );
    _controller.addListener(() {
      if (mounted) {
        setState(() {});
      }
    });
    initControllerFunctions();
    super.initState();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  initControllerFunctions() {
    widget.controller.animateToEnd = () {
      if (mounted) {
        _controller.forward();
        return true;
      } else {
        return false;
      }
    };
    widget.controller.animateToStart = () {
      if (mounted) {
        _controller.reverse();
        return true;
      } else {
        return false;
      }
    };
    widget.controller.isStart = () => _controller.value == 0.0;
    widget.controller.isEnd = () => _controller.value == 1.0;
  }

  _onStartIconPress() {
    if (widget.onStartIconPress() && mounted) _controller.forward();
  }

  _onEndIconPress() {
    if (widget.onEndIconPress() && mounted) _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    double x = _controller.value;
    double y = 1.0 - _controller.value;
    double angleX = math.pi / 180 * (180 * x);
    double angleY = math.pi / 180 * (180 * y);

    Widget first() {
      final icon = Icon(widget.startIcon, size: widget.size);
      return Transform.rotate(
        angle: widget.clockwise ?? false ? angleX : -angleX,
        child: Opacity(
          opacity: y,
          child: IconButton(
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            iconSize: widget.size ?? 24.0,
            color: widget.startIconColor ?? Theme.of(context).primaryColor,
            disabledColor: Colors.grey.shade500,
            icon: widget.startTooltip == null
                ? icon
                : Tooltip(
                    message: widget.startTooltip!,
                    child: icon,
                  ),
            onPressed: _onStartIconPress,
          ),
        ),
      );
    }

    Widget second() {
      final icon = Icon(widget.endIcon);
      return Transform.rotate(
        angle: widget.clockwise ?? false ? -angleY : angleY,
        child: Opacity(
          opacity: x,
          child: IconButton(
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            iconSize: widget.size ?? 24.0,
            color: widget.endIconColor ?? Theme.of(context).primaryColor,
            disabledColor: Colors.grey.shade500,
            icon: widget.endTooltip == null
                ? icon
                : Tooltip(
                    message: widget.endTooltip!,
                    child: icon,
                  ),
            onPressed: _onEndIconPress,
          ),
        ),
      );
    }

    return Stack(
      alignment: Alignment.center,
      children: [
        x == 1 && y == 0 ? second() : first(),
        x == 0 && y == 1 ? first() : second(),
      ],
    );
  }
}

class AnimateIconController {
  late bool Function() animateToStart, animateToEnd;
  late bool Function() isStart, isEnd;
}
