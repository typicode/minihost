<app>
  <p each={ name, target in targets }>
    <a href="http://{ name }.127.0.0.1.xip.io:{ parent.port }">{ name }</a>
  </p>

  <script>
    this.port = location.port

    $.get('_targets', function (targets) {
      this.targets = targets
      this.update()
    }.bind(this))
  </script>
</app>