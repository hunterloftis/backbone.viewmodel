$(document).ready(function() {

  module("Integration");

  test("View binding with computed attributes", function() {

    var model = new Backbone.Model({
      first: 'Hunter',
      last: 'Loftis',
      age: 27,
      occupation: ''
    });

    var vm = new Backbone.ViewModel({
      model: undefined,
      occupation: ''
    });
    vm.virtual('isAdult', {
      fail: false,
      get: function() {
        return this.get('model').get('age') >= 18;
      }
    });
    vm.virtual('fullname', {
      fail: '',
      get: function() {
        var model = this.get('model');
        return model.get('first') + ' ' + model.get('last');
      }
    });

    strictEqual(vm.get('isAdult'), false, 'isAdult is false with no model');
    strictEqual(vm.get('fullname'), '', 'fullname is empty with no model');

    vm.set('model', model);
    strictEqual(vm.get('isAdult'), true, 'isAdult is true once model is connected');
    strictEqual(vm.get('fullname'), 'Hunter Loftis', 'fullname is Hunter Loftis once model is connected');

    strictEqual($('#intVisible').css('display'), 'block', 'adult section is visible before binding');
    strictEqual($('#intText').text(), '', 'full name is empty before binding');
    strictEqual($('#intVal').val(), '', 'occupation is empty before binding');

    vm.bindView('data-bind-int');
    strictEqual($('#intVisible').css('display'), 'block', 'adult section is visible after binding');
    strictEqual($('#intText').text(), 'Hunter Loftis', 'full name is Hunter Loftis after binding');
    strictEqual($('#intVal').val(), '', 'occupation is empty after binding');

    model.set('age', 17);
    strictEqual($('#intVisible').css('display'), 'none', 'adult section is hidden after model change');

  });

});