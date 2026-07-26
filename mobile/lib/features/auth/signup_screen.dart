import 'package:flutter/material.dart';
import '../../core/widgets/app_widgets.dart';
import '../../mock/mock_repository.dart';
import '../home/main_shell.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});
  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final key = GlobalKey<FormState>();
  final name = TextEditingController();
  final email = TextEditingController();
  final phone = TextEditingController();
  final password = TextEditingController();
  final confirm = TextEditingController();
  bool terms = false, loading = false, created = false;

  Future<void> submit() async {
    if (!key.currentState!.validate()) {
      return;
    }
    if (!terms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please accept Terms & Privacy Policy.')),
      );
      return;
    }
    setState(() => loading = true);
    await MockRepository().demoDelay();
    if (mounted) {
      setState(() {
        loading = false;
        created = true;
      });
    }
  }

  @override
  void dispose() {
    for (final controller in [name, email, phone, password, confirm]) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Create account')),
    body: SafeArea(
      child: created
          ? AppStateView(
              icon: Icons.verified_outlined,
              title: 'Account preview created',
              message:
                  'No real account was created. Continue with the local demo experience.',
              action: () => Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const MainShell()),
                (_) => false,
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(22),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Form(
                    key: key,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Join Khoya Paya',
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Protect your belongings and help your community recover.',
                        ),
                        const SizedBox(height: 22),
                        AppTextField(
                          controller: name,
                          label: 'Full name',
                          validator: (v) => (v?.trim().length ?? 0) < 2
                              ? 'Enter your full name'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        AppTextField(
                          controller: email,
                          label: 'Email',
                          keyboardType: TextInputType.emailAddress,
                          validator: (v) => v == null || !v.contains('@')
                              ? 'Enter a valid email'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        AppTextField(
                          controller: phone,
                          label: 'Phone (optional)',
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 12),
                        AppTextField(
                          controller: password,
                          label: 'Password',
                          obscure: true,
                          validator: (v) => (v?.length ?? 0) < 8
                              ? 'Use at least 8 characters'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        AppTextField(
                          controller: confirm,
                          label: 'Confirm password',
                          obscure: true,
                          validator: (v) => v != password.text
                              ? 'Passwords do not match'
                              : null,
                        ),
                        CheckboxListTile(
                          contentPadding: EdgeInsets.zero,
                          value: terms,
                          onChanged: (v) => setState(() => terms = v ?? false),
                          title: const Text(
                            'I agree to Terms & Privacy Policy',
                          ),
                          controlAffinity: ListTileControlAffinity.leading,
                        ),
                        AppButton(
                          label: loading
                              ? 'Creating preview...'
                              : 'Create Account',
                          onPressed: loading ? null : submit,
                        ),
                        Center(
                          child: TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Already have an account? Login'),
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
