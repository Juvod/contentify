var DocumentHistory;

module.exports = DocumentHistory = (function() {
  function DocumentHistory(initialHistory, me) {
    var author, hist, _i, _len;
    this.me = me;
    this.current = 0;
    this.history = [];
    this.listeners = {};
    for (_i = 0, _len = initialHistory.length; _i < _len; _i++) {
      hist = initialHistory[_i];
      author = this.getAuthor(hist);
      this.history.push({
        sha: hist.sha,
        version_type: hist.commit_type,
        message: hist.commit.message,
        login: author.login,
        avatar_url: author.avatar_url
      });
    }
    this.generateTemplate();
  }

  DocumentHistory.prototype.getAuthor = function(commit) {
    var _ref;
    if ((_ref = commit.author) != null ? _ref.login : void 0) {
      return {
        login: commit.author.login,
        avatar_url: commit.author.avatar_url
      };
    } else {
      return {
        login: commit.commit.author.name,
        avatar_url: 'http://www.gravatar.com/avatar/' + MD5(commit.commit.author.email.trim().toLowerCase())
      };
    }
  };

  DocumentHistory.prototype.add = function(hist) {
    var author;
    author = this.getAuthor(hist);
    this.history.unshift({
      sha: hist.sha,
      version_type: hist.commit_type,
      message: hist.commit.message,
      login: author.login,
      avatar_url: author.avatar_url
    });
    if (this.current !== 0) {
      this.current++;
    }
    return this.renderElement(0);
  };

  DocumentHistory.prototype.setLocalChanges = function(state) {
    var _ref, _ref1;
    if (state) {
      if (((_ref = this.history[0]) != null ? _ref.version_type : void 0) === 'local') {
        return false;
      }
      this.history.unshift({
        version_type: 'local',
        message: 'Local changes',
        login: this.me.get('login'),
        avatar_url: this.me.get('avatar_url')
      });
      if (this.current !== 0) {
        this.current++;
      }
      return this.renderElement(0);
    } else {
      if (!this.history[0] || ((_ref1 = this.history[0]) != null ? _ref1.version_type : void 0) !== 'local') {
        return false;
      }
      this.history.shift();
      this.container.find('p:first').remove();
      this.container.find('p.active').removeClass('active');
      return this.container.find('p:eq(' + this.current.toString() + ')').addClass('active');
    }
  };

  DocumentHistory.prototype.on = function(e, callback) {
    if (!this.listeners[e]) {
      this.listeners[e] = [];
    }
    return this.listeners[e].push(callback);
  };

  DocumentHistory.prototype.renderElement = function(index, init) {
    var elem, selector;
    if (!init) {
      init = false;
    }
    elem = this.history[index];
    if (init) {
      this.container.append(this.template(elem));
    } else if (index === 0) {
      this.container.prepend(this.template(elem));
    } else {
      this.container.find('p:eq(' + index.toString() + ')').html(this.template(elem));
    }
    selector = this.container.find('p:eq(' + index.toString() + ')');
    if (index === this.current) {
      this.container.find('p.active').removeClass('active');
      selector.addClass('active');
    }
    return selector.click((function(_this) {
      return function() {
        var ind;
        if (!selector.hasClass('active')) {
          ind = selector.index();
          return _this.change(ind);
        }
      };
    })(this));
  };

  DocumentHistory.prototype.change = function(index) {
    this.current = index;
    this.container.find('p.active').removeClass('active');
    this.container.find('p:eq(' + index.toString() + ')').addClass('active');
    return this.listeners['select'].each((function(_this) {
      return function(fct) {
        return fct(_this.history[index], index);
      };
    })(this));
  };

  DocumentHistory.prototype.render = function(container) {
    var i, _results;
    this.container = container;
    this.container.html('');
    _results = [];
    for (i in this.history) {
      _results.push(this.renderElement(parseInt(i), true));
    }
    return _results;
  };

  DocumentHistory.prototype.generateTemplate = function() {
    var content;
    content = '<p> <img width="42" height="42" title="{{login}}" class="img-circle {{version_type}}" src="{{avatar_url}}"> <span class="msg">{{message}}</span> </p>';
    return this.template = Handlebars.compile(content);
  };

  return DocumentHistory;

})();
