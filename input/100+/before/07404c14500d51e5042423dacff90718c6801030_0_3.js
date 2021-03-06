function(){
  
    function ActivitiesVM(acts)
    {
        var self = this;
        this.activities = ko.observableArray(acts);

        this.type = ko.observable();
        this.date = ko.observable()
        this.hours = ko.observable()
        this.description = ko.observable();
        this.jobOrder = ko.observable();
        this.activity = ko.observable();

        this.jobOrders = ko.observableArray();
        this.jobOrderActivities = ko.observableArray();
        this.activityTypes = ko.observableArray();

        this.addActivity = function(){
            var type = self.type();
            var date = self.date();
            var hours = self.hours();
            var description = self.description();
            var jobOrder = self.jobOrder();
            var activity = self.activity();
            var data = { type: type, date:date, hours:hours, description: description, jobOrder: jobOrder, activity: activity };
            console.log('ready to post', self.date());
            $.post('user_activities', data, function (data){  
                var result = $.parseJSON(data);
                newActivity = new ActivityVM(result.id, result.type, result.date, result.hours, result.description, result.jobOrder, result.activity);
                self.activities.push(newActivity);
               
                self.hours('');
                self.description('');    
                $('#newActivity').addClass('hide');
            });
        };

        this.removeActivity = function(act){
            if (window.confirm('cancellare?')){
                $.ajax({
                        type: 'DELETE',
                        url: 'user_activities/' + act.id(),
                        success: function(){
                             self.activities.remove(act);
                        }
                });
            }
        };

        this.jobOrder.subscribe(function(newJobOrder){
          self.jobOrderActivities.removeAll();
          $.getJSON('job_orders/' + self.jobOrder(), function(data){
            self.jobOrderActivities(data.activities);
          });
        });
    }

    function ActivityVM(id, type, date, hours, description, jobOrder, activity)
    {
        var self = this;
        this.id = ko.observable(id);
        this.type = ko.observable(type);
        this.date = ko.observable(date);
        this.hours = ko.observable(hours);
        this.description = ko.observable(description);
        this.jobOrder = ko.observable(jobOrder);
        this.activity = ko.observable(activity);
        this.activityJobOrder  = ko.computed(function() {
            return this.activity() + ' (' + this.jobOrder() + ')'
        }, this);
    }   

    var month = $('#date_month').val();
    var year = $('#date_year').val();
    var user = $('#user').val();


    var activityList = new ActivitiesVM([new ActivityVM(1, 'today', '10', 'desc', 'yo', 'acy2')]);
    
    $.getJSON('/job_orders', function(data){
        activityList.jobOrders(data);
    });

    $.getJSON('/user_activity_types', function(data){
        activityList.activityTypes(data);
    });


    $.getJSON('/user_activities/'+ user + '/' + year + '/' + month, function (result){
        console.log(result);
        var current = [];
        $.each(result, function(index, item){
            current.push(new ActivityVM(item.id, item.type, item.date, item.hours, item.description, item.jobOrder, item.activity));
        });
        activityList.activities(current);
    });

    ko.applyBindings(activityList);

    ko.extenders.logChange = function(target, option) {
    target.subscribe(function(newValue) {
       console.log(option + ": " + newValue);
    });
    return target;
};
}