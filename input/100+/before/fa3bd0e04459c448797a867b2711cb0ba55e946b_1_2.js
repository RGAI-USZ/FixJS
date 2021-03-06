function Observable(Tools) {

	

	/**

	 * Defines the Observable

	 * @private

	 * @returns {_Observable}

	 */

	return function ObservableConstructor() {



		/**

		 * The list of topics

		 * @private

		 */

		var _topics = {};

		

		/**

		 * Add an observer

		 * @param {String} topic the topic to observe

		 * @param {Function} callback the callback to execute

		 * @param {Object} scope the scope in which to execute the callback

		 * @returns handler

		 */

		this.watch = function watch(topic, callback, scope) {

			if (typeof callback == "function") {

				var observers = _topics[topic] = _topics[topic] || [];

			

				observer = [callback, scope];

				observers.push(observer);

				return [topic,observers.indexOf(observer)];

				

			} else {

				return false;

			}

		};

		

		/**

		 * Remove an observer

		 * @param {Handler} handler returned by the watch method

		 * @returns {Boolean} true if there were subscribers

		 */

		this.unwatch = function unwatch(handler) {

			var topic = handler[0], idx = handler[1];

			if (_topics[topic] && _topics[topic][idx]) {

				// delete value so the indexes don't move

				delete _topics[topic][idx];

				// If the topic is only set with falsy values, delete it;

				if (!_topics[topic].some(function (value) {

					return !!value;

				})) {

					delete _topics[topic];

				}

				return true;

			} else {

				return false;

			}

		};

		

		/**

		 * Notifies observers that a topic has a new message

		 * @param {String} topic the name of the topic to publish to

		 * @param subject

		 * @returns {Boolean} true if there was subscribers

		 */

		this.notify = function notify(topic) {

			

			var observers = _topics[topic],

				l;



			if (observers) {

				l = observers.length;

				while (l--) {

					observers[l] && observers[l][0].apply(observers[l][1] || null, Tools.toArray(arguments).slice(1)); 

				}

				return true;

			} else {

				return false;

			}

		},

		

		/**

		 * Check if topic has the described observer

		 * @param {Handler}

		 * @returns {Boolean} true if exists

		 */

		this.hasObserver = function hasObserver(handler) {

			return !!( handler && _topics[handler[0]] && _topics[handler[0]][handler[1]]);

		};

		

		/**

		 * Check if a topic has observers

		 * @param {String} topic the name of the topic

		 * @returns {Boolean} true if topic is listened

		 */

		this.hasTopic = function hasTopic(topic) {

			return !!_topics[topic];

		};

		

		/**

		 * Unwatch all or unwatch all from topic

		 * @param {String} topic optional unwatch all from topic

		 * @returns {Boolean} true if ok

		 */

		this.unwatchAll = function unwatchAll(topic) {

			if (_topics[topic]) {

				delete _topics[topic];

			} else {

				_topics = {};

			}

			return true;

		};

		

	};

	

}