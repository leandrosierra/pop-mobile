import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/screens/homepage/home.dart';

class FlexTitleBar extends StatelessWidget {
  final GestureTapCallback leftButtonAction;
  final GestureTapCallback rightButtonAction;
  final bool leftEnabled;
  final bool rightEnabled;

  const FlexTitleBar(
      {Key? key,
      this.leftEnabled = true,
      this.rightEnabled = true,
      required this.leftButtonAction,
      required this.rightButtonAction})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    bool isLandScape =
        MediaQuery.of(context).orientation == Orientation.landscape;
    return Column(
      children: [
        Container(height: 40.h, color: primarycolor),
        Container(
          //decoration: BoxDecoration(border: Border.all(color: Colors.black)),
          padding: EdgeInsets.symmetric(vertical: 30.h, horizontal: 60.h),
          child: Row(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              (leftEnabled)
                  ? GestureDetector(
                      onTap: leftButtonAction,
                      child: SizedBox(
                          width: isLandScape ? 30.w : 60.w,
                          height: 60.h,
                          child: SvgPicture.asset(
                              'assets/icons/profile_icon.svg')),
                    )
                  : Container(),
              GestureDetector(
                onTap: () => Get.offAll(const HomePage()),
                child: Text('POP!',
                    style: GoogleFonts.bebasNeue(
                        color: primarycolor,
                        fontSize: isLandScape ? 35.sp : 70.sp)),
              ),
              (rightEnabled)
                  ? GestureDetector(
                      onTap: rightButtonAction,
                      child: SizedBox(
                          width: 60.w,
                          height: 60.h,
                          child: SvgPicture.asset(
                              'assets/icons/question_icon.svg')),
                    )
                  : Container(),
            ],
          ),
        ),
      ],
    );
  }
}
