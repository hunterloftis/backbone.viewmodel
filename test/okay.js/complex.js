$(document).ready(function() {

  module("Complex");
  
  test("a long chain of inter-related dependencies", function() {
    var users = ok.collection([]),
        active_user = ok.base();
    
    var active_email = ok.dependent(function() {
      if (active_user() && active_user().emails()) {
        return active_user().emails()[active_user().emails().length - 1];
      }
      return '';
    });
    
    var user_number = ok.dependent(function() {
      if (active_user()) {
        return users().indexOf(active_user());
      }
      else {
        return -1;
      }
    });
    
    function User() {
      this.first_name = ok.base('');
      this.last_name = ok.base('');
      this.age = ok.base(26);
      
      this.emails = ok.collection();
      
      this.name = ok.dependent(function() {
        if (this.first_name() || this.last_name()) {
          return this.first_name() + ' ' + this.last_name();  
        }
        else {
          return 'un-named'
        }
      }, this);
      
      users.push(this);
    }
    
    var user1 = new User();
    
    strictEqual(user1.name(), 'un-named', 'user1 initializes name correctly');
    
    user1.first_name('Hunter');
    user1.last_name('Loftis');
    
    strictEqual(user1.name(), 'Hunter Loftis', 'user1 calculates updated name correctly');
    
    user1.emails.push('hunter@hunterloftis.com');
    user1.emails.push('hunter@skookum.com');
    
    strictEqual(user1.emails()[1], 'hunter@skookum.com', 'user2 updates email correctly');
    
    var user2 = new User();
    user2.first_name('Jim');
    user2.last_name('Snodgrass');
    user2.emails.push('jim@skookum.com');
    
    strictEqual(users().length, 2, 'two users have been entered');
    strictEqual(user_number(), -1, 'user_number finds no user yet');
    strictEqual(active_email(), '', 'active_email starts as an empty string');
    
    active_user(user1);
    
    strictEqual(user_number(), 0, 'user_number finds the first user');
    strictEqual(active_email(), 'hunter@skookum.com', 'active_email updates correctly');
    
    active_user(user2);
    
    strictEqual(user_number(), 1, 'user_number finds the first user');
    strictEqual(active_email(), 'jim@skookum.com', 'active_email updates correctly');
    
    //strictEqual(obj.dependentTriple(), 3, 'dependent initializes accurately');

  });

  
});