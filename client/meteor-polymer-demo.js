Items = new Meteor.Collection('items');


// used by the sliders
Session.setDefault("counter", 50);

Template.home.helpers({
    items: function (argument) {
        return Items.find();
    }
});


Template.home.rendered = function (argument) {
    // After <paper-dialog> is created activate the animation
    $('paper-dialog')[0].toggle();
    console.log('created');
}

Template.home.events({
    'core-overlay-close-completed, tap [data-action="close-dialog"]': function () {
        console.log('paper-dialog DOM cleanup');
        $('paper-dialog').remove();
        $('.core-overlay-backdrop').remove();
    },
    'tap [data-del]': function () {
        // increment the counter when button is clicked
        Items.remove({_id: this._id});
        console.log('data-del');
    }
});

Template.sidebar.events({
    'tap [data-action="open-dialog"]': function () {
        Blaze.render(Template.home, document.getElementById('placeholder'));
        // refill data
        if (Items.find().count() == 0) {
            for (var i = 0; i < 10; i++) {
                Items.insert({name: 'item ' + Random.id(), rank: i});
            }
        }
    },
    'tap [data-del]': function () {
        // increment the counter when button is clicked
        Items.remove({_id: this._id});
        console.log('data-del');
    }
});


Template.app.helpers({
    counter: function () {
        return Session.get("counter");
    },
    items: function () {
        return Items.find();
    },
    progress: function () {
        return Session.get("progress");
    }

});

Template.app.events({

    'tap [data-action="open-dialog"]': function () {
        Blaze.render(Template.home, document.body);
        console.log('open');
    },

    'change #uno': function (e, template) {
        // debugger
        Session.set('counter', e.target.value);
    },
    'tap paper-button.colored': function () {
        var val = Session.get('progress');
        val = (val != null) ? val + 10 : 0;
        Session.set('progress', val);
    },
    'tap [data-del]': function () {
        Items.remove({_id: this._id});
        console.log('data-del app');
    }
});

Template.app.rendered = function (argument) {
    var navicon = document.getElementById('navicon');
    var drawerPanel = document.getElementById('drawerPanel');
    navicon.addEventListener('tap', function () {
        drawerPanel.togglePanel();
    });
}

Template.taskItem.helpers({
    showHover: function () {
        return this.isHover || false;
    },
    getItemClass: function () {
        return this.checked ? 'done' : '';
    },
    isEdit: function () {
        var equals = Session.equals('isEdit', this._id);
        return !equals;
    }
})

Template.taskItem.events({
    'change .toggle-checked': function (event) {

        var checked = event.currentTarget.checked;

        Todos.update(this._id, {$set: {checked: checked}});
    },
    'click .delete-todo': function (event) {
        Todos.remove(this._id);
    },
    'tap .t-label': function (event) {
        Session.set('isEdit', this._id);
    },
    'keydown input[type=text]': function (event) {
        // ESC or ENTER
        if (event.which === 13) {
            event.preventDefault();
            var name = $(event.currentTarget).val();
            Session.set('isEdit', null);
            Todos.update(this._id, {$set: {name: name}});
        } else if (event.which === 27) {
            event.preventDefault();
            $(event.currentTarget).val(this.name);
            Session.set('isEdit', null);
        }

    }
})
Template.tasks.events({
    "submit form": function (e) {
        e.preventDefault();

        var targetSelector = $(e.target);
        var name = targetSelector.find('#name').val();
        var task = {
            name: name
        }
        Todos.insert(task, function (error) {
            if (error) {
                // display the error to the user
                throwError(error.reason);
            } else {
                targetSelector.find('#name').val("");
            }
        })
    }

});
Template.tasks.helpers({
    tasks: function (argument) {
        return Todos.find();
    }
});

Meteor.startup(function (argument) {
    window.addEventListener('polymer-ready', function (e) {
        $('body').css('visibility', 'visible');
    });
});



