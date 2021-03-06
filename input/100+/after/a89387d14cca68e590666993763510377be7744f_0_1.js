function (err, smtp_client) {
        smtp_client.next = next;
        var rcpt = 0;
        var send_rcpt = function () {
            if (rcpt < connection.transaction.rcpt_to.length) {
                smtp_client.send_command('RCPT',
                    'TO:' + connection.transaction.rcpt_to[rcpt]);
                rcpt++;
            }
            else {
                smtp_client.send_command('DATA');
            }
        };
        smtp_client.on('mail', send_rcpt);
        if (config.main.one_message_per_rcpt) {
            smtp_client.on('rcpt', function () { smtp_client.send_command('DATA'); });
        }
        else {
            smtp_client.on('rcpt', send_rcpt);
        }

        smtp_client.on('data', function () {
            smtp_client.start_data(connection.transaction.data_lines);
        });

        smtp_client.on('dot', function () {
            if (rcpt < connection.transaction.rcpt_to.length) {
                smtp_client.send_command('RSET');
            }
            else {
                smtp_client.call_next(OK, smtp_client.response + ' (' + connection.transaction.uuid + ')');
                smtp_client.release();
            }
        });

        smtp_client.on('rset', function () {
            smtp_client.send_command('MAIL',
                'FROM:' + connection.transaction.mail_from);
        });

        smtp_client.on('bad_code', function (code, msg) {
            smtp_client.release();
            smtp_client.call_next();
        });
    }