function () {
    return patio.connectAndExecute("mysql://test:testpass@localhost:3306/sandbox",
        function (db) {
            db.forceDropTable(["staff", "executive", "manager", "employee"]);
            db.createTable("employee", function () {
                this.primaryKey("id")
                this.name(String);
                this.kind(String);
            });
            db.createTable("manager", function () {
                this.foreignKey("id", "employee", {key:"id"});
                this.numStaff("integer");
            });
            db.createTable("executive", function () {
                this.foreignKey("id", "manager", {key:"id"});
                this.numManagers("integer");
            });
            db.createTable("staff", function () {
                this.foreignKey("id", "employee", {key:"id"});
                this.foreignKey("managerId", "manager", {key:"id"});
            });
        }).addCallback(function (db) {
            DB = db;
        });
}