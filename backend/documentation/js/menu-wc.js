'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">API</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AdminModule.html" data-type="entity-link">AdminModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AdminModule-4138d1342106cd1ac6dbd72941e637f7"' : 'data-target="#xs-controllers-links-module-AdminModule-4138d1342106cd1ac6dbd72941e637f7"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AdminModule-4138d1342106cd1ac6dbd72941e637f7"' :
                                            'id="xs-controllers-links-module-AdminModule-4138d1342106cd1ac6dbd72941e637f7"' }>
                                            <li class="link">
                                                <a href="controllers/AdminController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AdminController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AdminModule-4138d1342106cd1ac6dbd72941e637f7"' : 'data-target="#xs-injectables-links-module-AdminModule-4138d1342106cd1ac6dbd72941e637f7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AdminModule-4138d1342106cd1ac6dbd72941e637f7"' :
                                        'id="xs-injectables-links-module-AdminModule-4138d1342106cd1ac6dbd72941e637f7"' }>
                                        <li class="link">
                                            <a href="injectables/AdminService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AdminService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AppModule-86435d7e6ca850416c9167ca36654327"' : 'data-target="#xs-controllers-links-module-AppModule-86435d7e6ca850416c9167ca36654327"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-86435d7e6ca850416c9167ca36654327"' :
                                            'id="xs-controllers-links-module-AppModule-86435d7e6ca850416c9167ca36654327"' }>
                                            <li class="link">
                                                <a href="controllers/AdminController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AdminController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/AppController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/JuniorController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">JuniorController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppModule-86435d7e6ca850416c9167ca36654327"' : 'data-target="#xs-injectables-links-module-AppModule-86435d7e6ca850416c9167ca36654327"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-86435d7e6ca850416c9167ca36654327"' :
                                        'id="xs-injectables-links-module-AppModule-86435d7e6ca850416c9167ca36654327"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthenticationModule.html" data-type="entity-link">AuthenticationModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AuthenticationModule-95273e8ced1e9c705189f85ffc0ac9a9"' : 'data-target="#xs-injectables-links-module-AuthenticationModule-95273e8ced1e9c705189f85ffc0ac9a9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthenticationModule-95273e8ced1e9c705189f85ffc0ac9a9"' :
                                        'id="xs-injectables-links-module-AuthenticationModule-95273e8ced1e9c705189f85ffc0ac9a9"' }>
                                        <li class="link">
                                            <a href="injectables/AuthenticationService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AuthenticationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>JwtStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/GuardsModule.html" data-type="entity-link">GuardsModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/JuniorModule.html" data-type="entity-link">JuniorModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-JuniorModule-af3a5ec4afbb178e6c5e34edf88d1013"' : 'data-target="#xs-controllers-links-module-JuniorModule-af3a5ec4afbb178e6c5e34edf88d1013"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-JuniorModule-af3a5ec4afbb178e6c5e34edf88d1013"' :
                                            'id="xs-controllers-links-module-JuniorModule-af3a5ec4afbb178e6c5e34edf88d1013"' }>
                                            <li class="link">
                                                <a href="controllers/JuniorController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">JuniorController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-JuniorModule-af3a5ec4afbb178e6c5e34edf88d1013"' : 'data-target="#xs-injectables-links-module-JuniorModule-af3a5ec4afbb178e6c5e34edf88d1013"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-JuniorModule-af3a5ec4afbb178e6c5e34edf88d1013"' :
                                        'id="xs-injectables-links-module-JuniorModule-af3a5ec4afbb178e6c5e34edf88d1013"' }>
                                        <li class="link">
                                            <a href="injectables/JuniorService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>JuniorService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#controllers-links"' :
                                'data-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AdminController.html" data-type="entity-link">AdminController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AppController.html" data-type="entity-link">AppController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/JuniorController.html" data-type="entity-link">JuniorController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Admin.html" data-type="entity-link">Admin</a>
                            </li>
                            <li class="link">
                                <a href="classes/AdminUserViewModel.html" data-type="entity-link">AdminUserViewModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/Challenge.html" data-type="entity-link">Challenge</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConfigHelper.html" data-type="entity-link">ConfigHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/EditAdminDto.html" data-type="entity-link">EditAdminDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/EditJuniorDto.html" data-type="entity-link">EditJuniorDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Junior.html" data-type="entity-link">Junior</a>
                            </li>
                            <li class="link">
                                <a href="classes/JuniorUserViewModel.html" data-type="entity-link">JuniorUserViewModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginAdminDto.html" data-type="entity-link">LoginAdminDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginJuniorDto.html" data-type="entity-link">LoginJuniorDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterAdminDto.html" data-type="entity-link">RegisterAdminDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterJuniorDto.html" data-type="entity-link">RegisterJuniorDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResetJuniorDto.html" data-type="entity-link">ResetJuniorDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AdminEditInterceptor.html" data-type="entity-link">AdminEditInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AdminService.html" data-type="entity-link">AdminService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AppService.html" data-type="entity-link">AppService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthenticationService.html" data-type="entity-link">AuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JuniorEditInterceptor.html" data-type="entity-link">JuniorEditInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JuniorService.html" data-type="entity-link">JuniorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy.html" data-type="entity-link">JwtStrategy</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/RolesGuard.html" data-type="entity-link">RolesGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/JWTToken.html" data-type="entity-link">JWTToken</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});