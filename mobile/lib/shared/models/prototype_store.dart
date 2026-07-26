import 'package:flutter/material.dart';

class PostData {
  PostData({
    required this.id,
    required this.user,
    required this.title,
    required this.description,
    required this.status,
    required this.category,
    required this.location,
    required this.time,
    this.verified = false,
    this.reward = 0,
    this.color = '',
    this.brand = '',
    this.model = '',
    this.reactions = 0,
    this.comments = const [],
  });
  final String id, user, title, description, category, location, time;
  String status;
  final bool verified;
  final int reward;
  final String color, brand, model;
  int reactions;
  bool reacted = false, saved = false, hidden = false;
  final List<String> comments;
}

class ItemData {
  ItemData(
    this.id,
    this.name,
    this.category,
    this.status,
    this.color, {
    this.brand = '',
    this.model = '',
  });
  final String id, name, category, color, brand, model;
  String status;
}

class PrototypeStore extends ChangeNotifier {
  PrototypeStore._();
  static final instance = PrototypeStore._();

  final posts = <PostData>[
    PostData(
      id: 'p1',
      user: 'Aanya Sharma',
      title: 'Black wallet near Central Park',
      description:
          'Slim black wallet with a small stitched corner. No private document details are shown publicly.',
      status: 'Lost',
      category: 'Wallet',
      location: 'C-Scheme, Jaipur',
      time: '18 min',
      verified: true,
      reward: 500,
      color: 'Black',
    ),
    PostData(
      id: 'p2',
      user: 'Rohan Mehta',
      title: 'Found a blue Android phone',
      description:
          'Found near the café seating area. Owner should verify wallpaper and case details privately.',
      status: 'Found',
      category: 'Phone',
      location: 'Malviya Nagar, Jaipur',
      time: '32 min',
      brand: 'Android',
      color: 'Blue',
    ),
    PostData(
      id: 'p3',
      user: 'Meera Joshi',
      title: 'Missing indie dog, red collar',
      description:
          'Friendly medium-sized dog last seen close to the community garden.',
      status: 'Missing',
      category: 'Pet',
      location: 'Vaishali Nagar, Jaipur',
      time: '1 hr',
      verified: true,
      color: 'Brown',
    ),
    PostData(
      id: 'p4',
      user: 'Kabir Singh',
      title: 'Lost college documents folder',
      description:
          'Transparent folder containing academic papers. Sensitive numbers are intentionally omitted.',
      status: 'Lost',
      category: 'Document',
      location: 'Rajasthan University',
      time: '2 hr',
    ),
    PostData(
      id: 'p5',
      user: 'Nisha Rao',
      title: 'Found keys with green tag',
      description:
          'Three keys on a simple green tag, found outside an apartment lobby.',
      status: 'Found',
      category: 'Keys',
      location: 'Jagatpura, Jaipur',
      time: '3 hr',
      verified: true,
    ),
    PostData(
      id: 'p6',
      user: 'Khoya Paya Community',
      title: 'Backpack reunited with student',
      description:
          'Community verification helped return this backpack safely without exposing contact details.',
      status: 'Recovered',
      category: 'Bag',
      location: 'Mansarovar, Jaipur',
      time: 'Yesterday',
      verified: true,
    ),
    PostData(
      id: 'p7',
      user: 'Arjun College Club',
      title: 'Silver watch lost on campus',
      description:
          'Lost between the library and main auditorium after the afternoon event.',
      status: 'Lost',
      category: 'Watch',
      location: 'College Campus, Jaipur',
      time: 'Yesterday',
      reward: 1000,
      color: 'Silver',
    ),
    PostData(
      id: 'p8',
      user: 'Sunrise Residency',
      title: 'Found parcel in apartment lobby',
      description:
          'Unopened parcel handed to the security desk. Verify the recipient name privately.',
      status: 'Found',
      category: 'Parcel',
      location: 'Sunrise Apartments',
      time: '2 days',
      verified: true,
    ),
    PostData(
      id: 'p9',
      user: 'Priya Verma',
      title: 'Missing prescription glasses',
      description:
          'Black rectangular frame in a grey case, possibly near the bus stop.',
      status: 'Missing',
      category: 'Accessory',
      location: 'Tonk Road, Jaipur',
      time: '2 days',
      color: 'Black',
    ),
    PostData(
      id: 'p10',
      user: 'Dev Sharma',
      title: 'Recovered camera bag',
      description:
          'Safely recovered after a finder used the private verification flow.',
      status: 'Recovered',
      category: 'Electronics',
      location: 'Bani Park, Jaipur',
      time: '3 days',
      verified: true,
    ),
  ];

  final items = <ItemData>[
    ItemData(
      'KP-1042',
      'Work laptop',
      'Electronics',
      'Safe',
      'Space grey',
      brand: 'Nimbus',
      model: 'Pro 14',
    ),
    ItemData('KP-2088', 'Travel backpack', 'Bag', 'Lost', 'Navy blue'),
    ItemData('KP-3194', 'House keys', 'Keys', 'Safe', 'Silver'),
    ItemData('KP-4401', 'Milo', 'Pet', 'Missing', 'Brown'),
    ItemData('KP-5520', 'Old phone', 'Phone', 'Recovered', 'Black'),
  ];

  void toggleReaction(PostData post) {
    post.reacted = !post.reacted;
    post.reactions += post.reacted ? 1 : -1;
    notifyListeners();
  }

  void toggleSaved(PostData post) {
    post.saved = !post.saved;
    notifyListeners();
  }

  void hide(PostData post) {
    post.hidden = true;
    notifyListeners();
  }

  void addComment(PostData post, String text) {
    if (text.trim().isNotEmpty) {
      post.comments.add(text.trim());
      notifyListeners();
    }
  }

  void editComment(PostData post, int index, String text) {
    post.comments[index] = text;
    notifyListeners();
  }

  void deleteComment(PostData post, int index) {
    post.comments.removeAt(index);
    notifyListeners();
  }

  void addPost(PostData post) {
    posts.insert(0, post);
    notifyListeners();
  }

  void addItem(ItemData item) {
    items.insert(0, item);
    notifyListeners();
  }

  void setItemStatus(ItemData item, String status) {
    item.status = status;
    notifyListeners();
  }

  void deleteItem(ItemData item) {
    items.remove(item);
    notifyListeners();
  }
}
