'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.log = message =>
      serverless.cli.log.bind(serverless.cli)(`Migrations - ${message}`);

    this.commands = {
      migrate: {
        usage: 'Runs your database migrations',
        commands: {
          up: {
            usage: 'Runs forward migrations',
            lifecycleEvents: ['up'],
            options: {
              function: {
                usage: 'The name of the function that will perform the migration defaults to up',
                shortcut: 'f',
                default: 'up'
              }
            }
          },
          down: {
            usage: 'Rolls back migrations',
            lifecycleEvents: ['down'],
            options: {
              function: {
                usage: 'The name of the function that will perform the rollback defaults to down',
                shortcut: 'f',
                default: 'down'
              }
            }
          }
        }
      }
    };

    this.hooks = {
      'after:deploy:deploy': this.migrate.bind(this),
      'after:rollback:rollback': this.rollback.bind(this),
      'migrate:down:down': this.rollback.bind(this),
      'migrate:up:up': this.migrate.bind(this)
    };
  }

  migrate () {
    this.options.function = 'up';
    this.log(`Running migration function ${this.options.function}`);

    return this.serverless.pluginManager.spawn('invoke',{
      terminateLifecycleAfterExecution: true
    }).then(() => {
      this.log('Migrations complete');
    });
  }

  rollback () {
    this.options.function = 'down';
    this.log(`Running rollback function ${this.options.function}`);
    return this.serverless.pluginManager.spawn('invoke', {
      terminateLifecycleAfterExecution: true
    })
    .then(() => {
      this.log('Rollback complete');
    });
  }
}

module.exports = ServerlessPlugin;
