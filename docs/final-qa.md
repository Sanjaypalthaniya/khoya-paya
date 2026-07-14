# Final QA Flow

1. Signup a new user.
2. Login as that user.
3. Add an item.
4. Upload item image.
5. Generate QR code.
6. Open `/found/[uniqueCode]`.
7. Confirm owner contact details are not visible.
8. Submit finder message with optional photo.
9. Confirm scan log is created.
10. Confirm finder message appears in dashboard.
11. Confirm owner email alert is sent.
12. Turn Lost Mode on.
13. Scan QR again and confirm notification is created.
14. Open `/dashboard/notifications`.
15. Mark one notification read.
16. Mark all notifications read.
17. Open `/dashboard/settings/notifications`.
18. Disable email alerts and submit another finder message.
19. Confirm message saves and email is skipped.
20. Upgrade plan using Razorpay test mode.
21. Test item limit before and after upgrade.
22. Test Business bulk CSV upload.
23. Generate QR codes in bulk.
24. Download QR ZIP.
25. Export items CSV.
26. Login as admin.
27. Check admin notification and bulk activity pages.
28. Run production build:

```bash
npm run build
```
