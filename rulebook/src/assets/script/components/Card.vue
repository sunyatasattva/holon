<template>
  <article class="h-card">
    <header>
      <h1 class="card-header-main">
        <slot name="header-main"></slot>
      </h1>
      <span class="card-header-aside">
        <slot name="header-aside"></slot>
      </span>
    </header>
    <main class="card-content">
      <slot></slot>
    </main>
    <footer class="card-footer">
      <slot name="footer"></slot>
    </footer>
  </article>
</template>

<script>
export default {
  name: "card",
}
</script>

<style lang="scss">
  @import "../../style/_variables";
  
  .h-card {
    &:not(.is-compact) {
      align-items:      center;
      background-color: $dark-color-darker;
      margin-bottom:    $line-height;
      position:         relative;
    }
    
    header,
    main,
    footer,
    .card-header-aside {
      padding: 0 $padding;
      
      &:empty {
        display: none;
      }
    }
    
    h1 {
      font-size:   1rem;
      line-height: $line-height * 2;
      margin:      0;
    }
    
    header {
      background-color: darken($dark-color-darker, 5);
      line-height:      $line-height * 2;
      height:           $line-height * 2;
      position:         relative;
      
      &::before {
        border-right: $padding * 2 solid transparent;
        border-top:   $line-height * 2 solid $dark-color;
        content:      "";
        width:        0;
        height:       0;
        position:     absolute;
        top:          0;
        left:         0;
      }
      
      .icon-container-inner {
        display:      inline-block;
        margin-right: $padding;
      }
    }
    
    main {
      padding-top:    $line-height;
      padding-bottom:  $line-height;
      
      &:not(:empty) + .card-footer {
        padding-top: 0;
      }
      
      p:last-child {
        margin: 0;
      }
    }
    
    .card-header-aside {
      background-color: $blue-color;
      color:            white;
      padding:          0 $padding 0 $padding * 3;
      width:            $padding * 8;
      position:         absolute;
      top:              0;
      right:            0;
      
      &::after {
        border-left: $padding * 2 solid transparent;
        border-top:  $line-height * 2 solid $blue-color;
        content:     "";
        width:       0;
        height:      0;
        position:    absolute;
        top:         0;
        left:        -$padding * 2;
      }
    }
    
    .card-header-main {
      padding-left: $padding;
      
      > * > * {
        vertical-align: top;
      }
    }
    
    .card-footer {
      font-size: $unit-3;
      padding-top: $line-height;
      padding-bottom: $line-height;
      
      &::after {
        border-bottom: $line-height * 2 solid $dark-color;
        border-left:   $padding * 2 solid transparent;
        content:       "";
        width:         0;
        height:        0;
        position:      absolute;
        right:         0;
        bottom:        0;
      }
    }
    
    .material-icons {
      font-size: $unit-4;
    }
  }
</style>
