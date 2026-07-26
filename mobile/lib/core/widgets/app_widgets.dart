import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

enum AppButtonVariant {
  primary,
  dark,
  secondary,
  outline,
  ghost,
  danger,
  success,
}

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.secondary = false,
    this.danger = false,
    this.variant,
    this.loading = false,
    this.expand = true,
  });
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool secondary, danger;
  final AppButtonVariant? variant;
  final bool loading, expand;

  @override
  Widget build(BuildContext context) {
    final resolved =
        variant ??
        (danger
            ? AppButtonVariant.danger
            : secondary
            ? AppButtonVariant.secondary
            : AppButtonVariant.primary);
    final (background, foreground, border) = switch (resolved) {
      AppButtonVariant.primary => (
        AppColors.primary,
        Colors.white,
        Colors.transparent,
      ),
      AppButtonVariant.dark => (
        AppColors.dark,
        Colors.white,
        Colors.transparent,
      ),
      AppButtonVariant.secondary => (
        AppColors.surface,
        AppColors.text,
        AppColors.border,
      ),
      AppButtonVariant.outline => (
        Colors.transparent,
        AppColors.primary,
        AppColors.primary,
      ),
      AppButtonVariant.ghost => (
        Colors.transparent,
        AppColors.primary,
        Colors.transparent,
      ),
      AppButtonVariant.danger => (
        AppColors.error,
        Colors.white,
        Colors.transparent,
      ),
      AppButtonVariant.success => (
        AppColors.success,
        Colors.white,
        Colors.transparent,
      ),
    };
    final content = loading
        ? SizedBox.square(
            dimension: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2.2,
              color: foreground,
              semanticsLabel: '$label loading',
            ),
          )
        : icon == null
        ? Text(label, maxLines: 1, overflow: TextOverflow.ellipsis)
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 20),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          );
    final style = ButtonStyle(
      minimumSize: WidgetStatePropertyAll(
        Size(expand ? double.infinity : AppSize.touch, AppSize.button),
      ),
      padding: const WidgetStatePropertyAll(
        EdgeInsets.symmetric(horizontal: AppSpace.md),
      ),
      animationDuration: AppMotion.fast,
      shape: WidgetStatePropertyAll(
        RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
      ),
      backgroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) {
          return background.withValues(alpha: .45);
        }
        if (states.contains(WidgetState.pressed) &&
            resolved == AppButtonVariant.primary) {
          return AppColors.primaryActive;
        }
        return background;
      }),
      foregroundColor: WidgetStatePropertyAll(foreground),
      overlayColor: WidgetStatePropertyAll(foreground.withValues(alpha: .08)),
      side: WidgetStatePropertyAll(BorderSide(color: border)),
      elevation: const WidgetStatePropertyAll(0),
    );
    return Semantics(
      button: true,
      enabled: onPressed != null && !loading,
      label: loading ? '$label, loading' : label,
      child: FilledButton(
        onPressed: loading ? null : onPressed,
        style: style,
        child: AnimatedSwitcher(
          duration: AppMotion.fast,
          switchInCurve: AppMotion.curve,
          child: KeyedSubtree(key: ValueKey(loading), child: content),
        ),
      ),
    );
  }
}

class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.color,
    this.onTap,
    this.radius = AppRadius.lg,
  });
  final Widget child;
  final EdgeInsets padding;
  final Color? color;
  final VoidCallback? onTap;
  final double radius;
  @override
  Widget build(BuildContext context) => Material(
    color: color ?? AppColors.surface,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(radius),
      side: const BorderSide(color: AppColors.border),
    ),
    clipBehavior: Clip.antiAlias,
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(radius),
      splashColor: AppColors.primarySoft,
      highlightColor: AppColors.primarySubtle,
      child: Padding(padding: padding, child: child),
    ),
  );
}

class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.obscure = false,
    this.keyboardType,
    this.validator,
    this.textInputAction,
    this.onFieldSubmitted,
    this.prefixIcon,
    this.maxLines = 1,
  });
  final TextEditingController controller;
  final String label;
  final String? hint;
  final bool obscure;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onFieldSubmitted;
  final IconData? prefixIcon;
  final int maxLines;
  @override
  Widget build(BuildContext context) => TextFormField(
    controller: controller,
    obscureText: obscure,
    keyboardType: keyboardType,
    validator: validator,
    textInputAction: textInputAction,
    onFieldSubmitted: onFieldSubmitted,
    maxLines: obscure ? 1 : maxLines,
    decoration: InputDecoration(
      labelText: label,
      hintText: hint,
      prefixIcon: prefixIcon == null ? null : Icon(prefixIcon, size: 20),
    ),
  );
}

class AppIconButton extends StatelessWidget {
  const AppIconButton({
    super.key,
    required this.icon,
    required this.tooltip,
    required this.onPressed,
    this.selected = false,
  });
  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;
  final bool selected;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    selected: selected,
    label: tooltip,
    child: IconButton(
      tooltip: tooltip,
      onPressed: onPressed,
      constraints: const BoxConstraints.tightFor(
        width: AppSize.touch,
        height: AppSize.touch,
      ),
      style: IconButton.styleFrom(
        backgroundColor: selected ? AppColors.primarySoft : AppColors.surface,
        foregroundColor: selected ? AppColors.primary : AppColors.text,
        side: const BorderSide(color: AppColors.border),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
      ),
      icon: Icon(icon, size: 21),
    ),
  );
}

class BrandMark extends StatelessWidget {
  const BrandMark({super.key, this.size = 48});
  final double size;
  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    alignment: Alignment.center,
    decoration: BoxDecoration(
      color: AppColors.primary,
      borderRadius: BorderRadius.circular(size * .28),
    ),
    child: Text(
      'K',
      style: TextStyle(
        color: Colors.white,
        fontSize: size * .48,
        fontWeight: FontWeight.w900,
      ),
    ),
  );
}

class StatusChip extends StatelessWidget {
  const StatusChip(this.label, {super.key, this.color = AppColors.primary});
  final String label;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    decoration: BoxDecoration(
      color: color.withValues(alpha: .1),
      borderRadius: BorderRadius.circular(AppRadius.pill),
    ),
    child: Text(
      label,
      style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700),
    ),
  );
}

class SectionHeader extends StatelessWidget {
  const SectionHeader(this.title, {super.key, this.action, this.onAction});
  final String title;
  final String? action;
  final VoidCallback? onAction;
  @override
  Widget build(BuildContext context) => Row(
    children: [
      Expanded(
        child: Text(title, style: Theme.of(context).textTheme.titleLarge),
      ),
      if (action != null) TextButton(onPressed: onAction, child: Text(action!)),
    ],
  );
}

class AppStateView extends StatelessWidget {
  const AppStateView({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.action,
  });
  final IconData icon;
  final String title, message;
  final VoidCallback? action;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 32,
            backgroundColor: AppColors.primarySoft,
            child: Icon(icon, color: AppColors.primary, size: 30),
          ),
          const SizedBox(height: 16),
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center),
          if (action != null) ...[
            const SizedBox(height: 20),
            SizedBox(
              width: 180,
              child: AppButton(label: 'Try again', onPressed: action),
            ),
          ],
        ],
      ),
    ),
  );
}

class LoadingSkeleton extends StatelessWidget {
  const LoadingSkeleton({super.key, this.height = 88});
  final double height;
  @override
  Widget build(BuildContext context) => Semantics(
    label: 'Loading content',
    child: TweenAnimationBuilder<double>(
      tween: Tween(begin: .45, end: .85),
      duration: AppMotion.success,
      curve: AppMotion.emphasized,
      builder: (_, opacity, _) => Container(
        height: height,
        decoration: BoxDecoration(
          color: AppColors.border.withValues(alpha: opacity),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
      ),
    ),
  );
}

class ProfileAvatar extends StatelessWidget {
  const ProfileAvatar(this.initials, {super.key, this.radius = 24});
  final String initials;
  final double radius;
  @override
  Widget build(BuildContext context) => CircleAvatar(
    radius: radius,
    backgroundColor: AppColors.primarySoft,
    child: Text(
      initials,
      style: const TextStyle(
        color: AppColors.primary,
        fontWeight: FontWeight.w800,
      ),
    ),
  );
}

class MessageTile extends StatelessWidget {
  const MessageTile({
    super.key,
    required this.name,
    required this.preview,
    this.unread = false,
  });
  final String name, preview;
  final bool unread;
  @override
  Widget build(BuildContext context) => ListTile(
    minTileHeight: 56,
    leading: ProfileAvatar(
      name.split(' ').map((word) => word[0]).take(2).join(),
    ),
    title: Text(
      name,
      style: TextStyle(fontWeight: unread ? FontWeight.w800 : FontWeight.w600),
    ),
    subtitle: Text(preview, maxLines: 1, overflow: TextOverflow.ellipsis),
    trailing: unread ? const Badge(label: Text('1')) : null,
  );
}

class NotificationTile extends StatelessWidget {
  const NotificationTile({
    super.key,
    required this.title,
    required this.time,
    this.read = false,
  });
  final String title, time;
  final bool read;
  @override
  Widget build(BuildContext context) => ListTile(
    minTileHeight: 56,
    leading: CircleAvatar(
      backgroundColor: read ? AppColors.background : AppColors.primarySoft,
      child: const Icon(Icons.notifications_none, color: AppColors.primary),
    ),
    title: Text(title),
    subtitle: Text(time),
  );
}

void showAppToast(BuildContext context, String message) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message)));
}
