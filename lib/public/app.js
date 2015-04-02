<app>
  <p each={ name, target in targets }>
    <strong>
      <a href="http://{ name }.127.0.0.1.xip.io:{ parent.port }">{ name }</a>
    </strong>
    <br>
    <small>
      <a href="http://localhost:{ target }">http://localhost:{ target }</a>
    </small>
  </p>

  <script>
    this.port = location.port

    $.get('_targets', function (targets) {
      this.targets = targets
      this.update()
    }.bind(this))
  </script>
</app>