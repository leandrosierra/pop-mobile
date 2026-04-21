import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/components/pop_app_animated_icon.dart';
import 'package:pop/constants.dart';

class SelectionItem extends StatefulWidget {
  final bool initialState;
  final String text;
  final Function? onPress;

  const SelectionItem(
      {Key? key, required this.text, required this.initialState, this.onPress})
      : super(key: key);

  @override
  State<SelectionItem> createState() => _SelectionItemState();
}

class _SelectionItemState extends State<SelectionItem> {
  late bool isSelected;
  late AnimateIconController c1;

  @override
  void initState() {
    c1 = AnimateIconController();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    isSelected = widget.initialState;
    return Row(mainAxisSize: MainAxisSize.min, children: [
      icon(),
      SizedBox(width: 20.w),
      Text(isSelected ? "${widget.text}✅" : widget.text,
          style: TextStyle(fontSize: 26.sp, fontWeight: FontWeight.normal))
    ]);
  }

  Widget icon() => GestureDetector(
        onTap: () {
          setState(() {
            isSelected = !isSelected;
          });
          widget.onPress!(isSelected);
        },
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 2.h),
          child: CircleAvatar(
            backgroundColor: primarycolor,
            radius: 30.h,
            child: (isSelected)
                ? const Icon(Icons.remove, color: Colors.white)
                : const Icon(Icons.add, color: Colors.white),
          ),
        ),
      );
}
