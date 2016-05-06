(function(exportName) {
  /*<remove>*/
  'use strict';
  /*</remove>*/

  var exports = exports || {};

  /*<jdists encoding="ejs" data="../package.json">*/
  /**
   * @file <%- name %>
   *
   * <%- description %>
   * @author
       <% (author instanceof Array ? author : [author]).forEach(function (item) { %>
   *   <%- item.name %> (<%- item.url %>)
       <% }); %>
   * @version <%- version %>
       <% var now = new Date() %>
   * @date <%- [
        now.getFullYear(),
        now.getMonth() + 101,
        now.getDate() + 100
      ].join('-').replace(/-1/g, '-') %>
   */
  /*</jdists>*/

	var count = 0;

	/**
	 * 调用 CSST
	 *
	 * @param {string} url 服务连接
	 * @param {Object|Function} opts/fn 配置项
	 * @param {Function} fn 回调函数
	 * @see https://github.com/webmodules/jsonp
	 */
	function csst(url, opts, fn) {
		if ('function' == typeof opts) {
			fn = opts;
			opts = {};
		}
		opts = opts || {};

		var prefix = opts.prefix || '__csst';

		// use the className name that was passed if one was provided.
		// otherwise generate a unique name by incrementing our counter.
		var id = opts.name || (prefix + (count++));

		var param = opts.param || 'id';
		var timeout = typeof opts.timeout !== 'undefined' ? timeout : null;
		var timer;

		if (timeout) {
			timer = setTimeout(function() {
				cleanup();
				if (fn) {
					fn(new Error('Timeout'));
				}
			}, timeout);
		}

		function cleanup() {
			if (link && link.parentNode) {
				link.parentNode.removeChild(link);
				link = null;
			}
			if (area && area.parentNode) {
				area.parentNode.removeChild(area);
				area = null;
			}
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			fn = null;
		}

		function handler() {
			if (fn) {
				var content = getComputedStyle(area, false).content;
				// 移除两边双引号
				content = content.replace(/^"([^]*)"$/, "$1");
				fn(null, content);
			}
			cleanup();
		}

		var head = document.querySelector('head');
		var link = document.createElement('link');
		var area = document.createElement('area');
		area.style.visibility = 'hidden';
		area.style.position = 'absolute';
		area.style.top = '-100px';
		area.id = id;
		document.documentElement.appendChild(area);

		area.addEventListener('animationstart', handler, false);
		area.addEventListener('webkitAnimationStart', handler, false);

		url += (url.indexOf('?') >= 0 ? '&' : '?') + param + '=' + encodeURIComponent(id);
		url = url.replace('?&', '?');

		link.href = url;
		link.rel = 'stylesheet';
		link.type = 'text/css';

		head.appendChild(link);

		return cleanup;
	}

	var exports = csst;

	if (typeof define === 'function') {
		if (define.amd) {
			define(function() {
				return exports;
			});
		}
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = exports;
	} else {
		window[exportName] = exports;
	}

})('csst');