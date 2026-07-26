import 'package:flutter/material.dart';
import '../../core/widgets/app_widgets.dart';
import '../../mock/mock_repository.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final email = TextEditingController();
  final key = GlobalKey<FormState>();
  bool loading = false, sent = false;
  Future<void> send() async {
    if (!key.currentState!.validate()) {
      return;
    }
    setState(() => loading = true);
    await MockRepository().demoDelay();
    if (mounted) {
      setState(() {
        loading = false;
        sent = true;
      });
    }
  }

  @override
  void dispose() {
    email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Reset password')),
    body: SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: sent
                ? AppStateView(
                    icon: Icons.mark_email_read_outlined,
                    title: 'Demo link ready',
                    message:
                        'This prototype does not send email. The success state is shown for design testing.',
                    action: () => Navigator.pop(context),
                  )
                : Form(
                    key: key,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const BrandMark(),
                        const SizedBox(height: 24),
                        Text(
                          'Find your account',
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Enter your email to preview the password-reset experience.',
                        ),
                        const SizedBox(height: 24),
                        AppTextField(
                          controller: email,
                          label: 'Email',
                          keyboardType: TextInputType.emailAddress,
                          validator: (v) => v == null || !v.contains('@')
                              ? 'Enter a valid email'
                              : null,
                        ),
                        const SizedBox(height: 18),
                        AppButton(
                          label: loading ? 'Preparing…' : 'Send Reset Link',
                          onPressed: loading ? null : send,
                        ),
                        Center(
                          child: TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Back to Login'),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ),
      ),
    ),
  );
}
