import 'package:flutter/material.dart';
import 'package:pop/components/pop_app_animated_icon.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SearchItem extends StatefulWidget {
  final Widget text;
  final Function? onPress;
  final bool initialState;
  final double? iconSize;

  const SearchItem(
      {Key? key,
      required this.text,
      this.onPress,
      this.initialState = false,
      this.iconSize})
      : super(key: key);

  @override
  State<SearchItem> createState() => _SearchItemState();
}

class _SearchItemState extends State<SearchItem> {
  late bool isSelected;
  late AnimateIconController c1;

  @override
  void initState() {
    c1 = AnimateIconController();
    super.initState();
    isSelected = widget.initialState;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        PopAppAnimatedIcon(
          startIcon: (isSelected) ? Icons.remove_circle : Icons.add_circle,
          endIcon: (isSelected) ? Icons.add_circle : Icons.remove_circle,
          controller: c1,
          duration: const Duration(milliseconds: 500),
          size: (widget.iconSize != null) ? widget.iconSize : 45.sp,
          onEndIconPress: () {
            widget.onPress!(isSelected);
            return true;
          },
          onStartIconPress: () {
            widget.onPress!(!isSelected);
            return true;
          },
        ),
        SizedBox(width: 20.w),
        widget.text
      ],
    );
  }
}
