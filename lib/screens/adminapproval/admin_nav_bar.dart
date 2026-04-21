import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/constants.dart';
import 'package:pop/screens/homepage/home.dart';
import 'dart:io' show Platform;
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AdminNavBar extends StatelessWidget {
  const AdminNavBar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: primarycolor,
      child: Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          backButton(),
          pop(),
          emptyContainer(),
        ],
      ),
    );
  }

  backButton() {
    return IconButton(
        onPressed: () => Get.back(),
        icon: Icon((Platform.isIOS) ? Icons.arrow_back_ios : Icons.arrow_back,
            color: Colors.white));
  }

  pop() {
    return GestureDetector(
      onTap: () => Get.offAll(const HomePage()),
      child: Text('POP!',
          style: GoogleFonts.bebasNeue(color: Colors.white, fontSize: 70.sp)),
    );
  }

  emptyContainer() {
    return Container(width: 80.w);
  }
}
