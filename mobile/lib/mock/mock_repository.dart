class DemoPost {
  const DemoPost(this.title, this.area, this.status, this.time);
  final String title, area, status, time;
}

class MockRepository {
  static const demoEmail = 'demo@khoyapaya.local';
  static const demoPassword = 'Demo1234';
  static const posts = [
    DemoPost('Black wallet near metro gate', 'Rajiv Chowk', 'Lost', '18 min'),
    DemoPost('Set of keys with blue tag', 'Lajpat Nagar', 'Found', '42 min'),
    DemoPost('Indie dog wearing red collar', 'Saket', 'Missing', '1 hr'),
  ];
  static const protectedItems = [
    'Work laptop',
    'Travel backpack',
    'House keys',
  ];
  static const messages = [
    'I found keys near the cafe entrance.',
    'Please verify the private identifying mark.',
  ];
  static const notifications = [
    'Your wallet report received a new view.',
    'A nearby found-item report was published.',
    'Your backpack QR profile is active.',
  ];
  static const claims = ['Wallet recovery awaiting verification'];
  static const badges = ['Trusted Helper', 'First Report', 'Safety Starter'];
  static const trustPoints = 240;
  Future<void> demoDelay() =>
      Future<void>.delayed(const Duration(milliseconds: 650));
}
