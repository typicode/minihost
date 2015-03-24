<app>

  <p each={ name, target in targets }>
    <a href="http://{name}.127.0.0.1.xip.io">{ name }</a>
  </p>

  <script>
    $.get('_targets', function (targets) {
      this.targets = targets
      this.update()
    }.bind(this))
  </script>
</app>