'use strict';

$(document).ready(() => {
  inizializza();
});

/**
 * Funzione gestione inizializzazione
 */
function inizializza() {
  // Dichiarazione variabili
  const iframe = $('#api-frame')[0];
  const version = '1.0.0';
  const urlid = '9c1e7cfb2f734c3fa0425379578bcef3';
  let client = null;

  caricaModello(iframe, version, urlid, client);

  $('.carica').on('click tap', () => {
    caricaModello(iframe, version, urlid, client);

    if ($('.player__lettore').hasClass('player__lettore--invisibile')) {
      $('.player__lettore').removeClass('player__lettore--invisibile');
    }
  });
}

/**
 * Funzione gestione inizializzazione API
 * @param {object} iframe Nodo DOM del lettore
 * @param {string} version Versione APP
 * @param {string} urlid ID Modello
 * @param {object} client Lettore modello
 */
function caricaModello(iframe, version, urlid, client) {
  let cliccato = false;

  client = new Sketchfab(version, iframe);

  client.init(urlid, {
    success: function onSuccess(api) {
      api.load();
      api.start();
      api.addEventListener('viewerready', () => {
        $('.player__lettore').removeClass('player__lettore--invisibile');
        $('.play').on('click tap', () => {
          api.start();
        });
        $('.stop').on('click tap', () => {
          api.stop();
        });
        $('.fov').on('click tap', () => {
          api.setFov(60);
        });
        $('.prospettiva').on('click tap', () => {
          api.lookat(
            [10, 13, 10], // eye position
            [10, 10, 10],   // target to lookat
            5.5          // duration of the animation in seconds
          );
        });
        // Animazione
        $('.panoramica').on('click tap', () => {
          let target = [0.0, 0.0, 1.0];
          let listaCamera = [{
              eye: [2, 0, 0],
          }, {
              eye: [1, 1, 0],
          }, {
              eye: [0, 2, 0],
          }, {
              eye: [-1, 1, 0],
          }, {
              eye: [-2, 0, 0],
          }, {
              eye: [-1, -1, 0],
          }, {
              eye: [0, -2, 0],
          }, {
              eye: [1, -1, 0],
          }];
          let cameraAttuale = 5;
          let loop = () => {
            cameraAttuale++;
              api.lookat(listaCamera[cameraAttuale % 8].eye, target, 4);

              setTimeout(loop, 5000);
          };

          api.start(loop);
        });
        $('.screenshot').on('click tap', () => {
          api.getScreenShot( 'image/png', (err, result) => {
            let height = $('#api-frame').height();
            let width = $('#api-frame').width();

            if (height < 100) {
                height = 100;
            }
            if (width > 100) {
                width = 100;
            }

            $(window)[0].open(result, '_blank', 'height = '+
            height + ', width = ' + width);
          });
        });
        // Navigazione Libera
        $('.navigazione').on('click tap', function() {
          if (!cliccato) {
            $('.player::before').css('visibility', 'visible');
            $('.player').addClass('libera');
            $(this).html('Navigazione libera (attiva)');

            cliccato = true;
          } else {
            $(this).html('Navigazione libera');
            $('.player').removeClass('libera');
            $('.player::before').css('visibility', 'hidden');

            cliccato = false;
          }
        });
        $('body').on('mousemove', function(e) {
          if ($('.player').hasClass('libera')) {
            // Calculate the location of the middle of the frame (Where we want the model to stay)
            let frameX = $('#api-frame').position().left + $('#api-frame').width() / 2;
            let frameY = $( '#api-frame' ).position().top + $('#api-frame').height() / 2;
            let x = e.pageX - frameX;
            let y = e.pageY - frameY;
            let z = 2;
            // Calculate the distance, normalize the vector by dividing by distance and multiplying by a factor
            let distanza = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
            x = (x / distanza) * 6;
            y = (y / distanza) * 6;
            z = (z / distanza) * 6;

            // x, y and z depend on how the model was made
            api.lookat([y, -x, z], [0, 0, 0], 0);
          }
        });
        // Oggetti
        $('.oggetti').on('click tap', () => {
            api.getNodeMap((err, nodes) => {
              if (!err) {
                console.log(nodes);

                $('.output').empty();
                $.each(nodes, (i, val) => {
                  $('.output')
                  .append(val.name + ' | ID: ' +
                  val.instanceID +'<br />');
                });
              }
            });
        });
        $('.nascosto').on('click tap', () => {
          api.hide('76');
        });
        $('.mostra').on('click tap', () => {
          api.show('76');
        });
        // Grafo
        $('.grafo').on('click tap', () => {
          let grafo = api.getSceneGraph();
          
          console.log(grafo);

          $('.output').empty();
          $('.output').append(grafo);

        });
        // Texture
        $('.texture').on('click tap', () => {
          api.getTextureList((err, textures) => {
            if (!err) {
              console.log(textures);

              $('.output').empty();
              $.each(textures, (i, val) => {
                $('.output')
                .append(val.name + ' | UID: ' +
                val.uid +'<br />');
              });
            }
          });
        });
        $('.texture-cambia').on('click tap', function() {
          let url = null;
          let id = null;

          switch($(this).attr('data-text')) {
            case 'marmo': 
              url = 'https://media.sketchfab.com/urls/9c1e7cfb2f734c3fa0425379578bcef3/dist/textures/7853c7fb6e3e4a01a406012949b26070/fccbc92f7d4844508b0d10f0984734d4.jpg';
              id = '7853c7fb6e3e4a01a406012949b26070';
              
              break;
            case 'chiaro':
              url = 'https://media.sketchfab.com/urls/9c1e7cfb2f734c3fa0425379578bcef3/dist/textures/c511c36f5e4f4279bed11cf319cfc719/24b29ac0ffe444b581127af2efb8fb4a.png';
              id = '7853c7fb6e3e4a01a406012949b26070';

              break;
            case 'scuro':
              url = 'https://media.sketchfab.com/urls/9c1e7cfb2f734c3fa0425379578bcef3/dist/textures/7853c7fb6e3e4a01a406012949b26070/fccbc92f7d4844508b0d10f0984734d4.jpg';
              id = 'c511c36f5e4f4279bed11cf319cfc719';
              
              break;
            case 'oro':
              url = 'https://media.sketchfab.com/urls/9c1e7cfb2f734c3fa0425379578bcef3/dist/textures/c511c36f5e4f4279bed11cf319cfc719/24b29ac0ffe444b581127af2efb8fb4a.png';
              id = 'c511c36f5e4f4279bed11cf319cfc719';

              break;
            default:
              break;
          }

          api.updateTexture(url, id, (err, textureUid) => {
              if (!err) {
                console.log(textureUid, url, id);

                $('.output').empty();
                $('.output').append('Texture aggiornata con uid: '+ textureUid);
              }
            }
          );
        });
        // Materiali
        $('.materiali').on('click tap', () => {
          api.getMaterialList((err, materials) => {
            if (!err) {
              console.log(materials);

              $('.output').empty();
              $.each(materials, (i, val) => {
                $('.output')
                .append(val.name + ' | stateSetID: ' +
                val.stateSetID +'<br />');
              });
            }
          });
        });
        $('.aggiorna').on('click tap', () => {
          api.getMaterialList((err, materials) => {
            // Turn off the diffuse on the first material
            let materiale = materials[0];

            materiale.channels.Opacity.enable = true;
            materiale.channels.Opacity.factor = 0;

            console.log(materiale);

            // Apply the change
            api.setMaterial(materiale, () => {
              $('.output').empty();
              $('.output').append('Opacità azzerata su '+ materiale.name);
            });
          });
        });
        $('.reset').on('click tap', () => {
          api.getMaterialList((err, materials) => {
            // Turn off the diffuse on the first material
            let materiale = materials[0];

            materiale.channels.Opacity.enable = false;
            materiale.channels.Opacity.factor = 1;

            console.log(materiale);
                      
            api.setMaterial(materiale, () => {
              $('.output').empty();
              $('.output').append('Valori di default su '+ materiale.name);
            });
          });
        });
        // Post Processing
        $('.filtri').on('click tap', () => {
          api.getPostProcessing((settings) => {
              console.log(settings);

              $('.output').empty();
              $.each(settings, (i, val) => {
                $('.output').append(i + ' | ' + val +'<br />');
              });
          });
        });
        $('.modifica').on('click tap', () => {
          api.setPostProcessing({
            sharpenEnable: false,
            rgbmDefault: 3,
            rgbmBloom: 2,
            grainEnable: true,
            chromaticAberrationEnable: true,
          });
          $('.output').empty();
          $('.output')
          .append('sharpenEnable disattivato<br />rgbmDefault: 3<br />rgbmBloom: 2<br />grainEnable: true<br />chromaticAberrationEnable: true');
        });
      });
    },
    error: function onError(callback) {
        $('aside').append(callback);
    },
    annotation: 1,
    annotation_cycle: 0,
    annotations_visible: 1,
    autospin: 0,
    autostart: 1,
    camera: 1,
    fps_speed: 60,
    preload: 1,
    scrollwheel: 1,
    ui_stop: 0,
    /**
     * Solo PRO:
     * transparent: 0, <- Sfondo
     * Solo BIZ:
     * ui_controls: 0, <- Toolbar (basso)
     * ui_general_controls: 0, <- Toolbar (destra)
     * ui_settings: 0,
     * ui_help: 0,
     * ui_hint: 0,
     * ui_fullscreen: 0,
     * ui_animations: 0, <- Menu
     * ui_annotations: 0, <- Menu
     * ui_infos: 0,
     */
  });
}
