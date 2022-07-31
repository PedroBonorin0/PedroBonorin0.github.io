import * as THREE from  'three';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';

/**
 * type == 1: Inimigo Aereo;
 * type == 2: Inimigo Terreste;
 * type == 3: Tiro Player;
 * type == 4: Missel Player;
 */

var shots = [];
var shotsCounter = 0;
var shotsOnScreen = [];

var audioLoader = new THREE.AudioLoader();
var listener = new THREE.AudioListener();

var enemyShotSound = new THREE.Audio(listener);
var playerShotSound = new THREE.Audio(listener);

var loader = new GLTFLoader();

export function buildShot(scn, enemy, player, type){
  if(type === 1){
    if(enemy.canShot){
      enemy.canShot = false;
      var newShot = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 0.8, 10),
        new THREE.MeshPhongMaterial({color: "rgb(255, 0, 0)", shininess: "1000", specular:"rgb(255,255,255)"})
      );

      newShot.rodou = false;
      newShot.type = 1;

      audioLoader.load('./sounds/enemyShot.mp3', function(buffer) {
        enemyShotSound.setBuffer(buffer);
        enemyShotSound.setLoop(false);
        if(enemyShotSound.isPlaying){
          enemyShotSound.stop();
        }
        enemyShotSound.play();
      });

      newShot.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
      newShot.lookAt(player.position);
      scn.add(newShot);
      shotsCounter++;
      shots.push(newShot);

      setTimeout(() => {
        enemy.canShot = true;
      }, 3000);
    }
  }

  if(type === 2){
    if(enemy.canShot){
      enemy.canShot = false;
      var newShot = new THREE.Mesh(
        new THREE.CylinderGeometry(1.0, 2, 10, 10),
        new THREE.MeshLambertMaterial({color: "rgb(255, 0, 0)"})
      );

      newShot.rodou = false;
      newShot.type = 2;

      newShot.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
      scn.add(newShot);
      shotsCounter++;
      shots.push(newShot);

      setTimeout(() => {
        enemy.canShot = true;
      }, 5000);
    }
  }

  if(type === 3){
    if(player.canShot) {
      player.canShot = false;
      var newShot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 5, 10),
        new THREE.MeshPhongMaterial({color: "rgb(0, 255, 0)", shininess: "1000", specular:"rgb(255,255,255)"})
      );
      newShot.rotateX(3.14/2);

      newShot.rodou = false;
      newShot.type = 3;

      audioLoader.load('./sounds/playerShot.mp3', function(buffer) {
        playerShotSound.setBuffer(buffer);
        playerShotSound.setLoop(false);
        if(playerShotSound.isPlaying){
          playerShotSound.stop();
        }
        playerShotSound.play();
      });

      newShot.position.set(player.position.x, player.position.y, player.position.z);
      scn.add(newShot);
      shotsCounter++;
      shots.push(newShot);

      setTimeout(() => {
        player.canShot = true;
      }, 250);
    }
  }

  if(type === 4){
    if(player.canMissel) {
      player.canMissel = false;

      var newShot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 1, 5, 10),
        new THREE.MeshLambertMaterial({color: "rgb(255, 0, 0)"})
      );

      newShot.rodou = false;
      newShot.type = 4;

      newShot.position.set(player.position.x, player.position.y, player.position.z);
      newShot.rotateX(-3.14/2);
      const name = Math.random();
      newShot.name = name;
      
      shotsCounter++;
      shots.push(newShot);
      
      var asset = {
        object: null,
        loaded: false,
      };
      
      loader.load( './assets/grenade.glb', function ( gltf ) {
        let obj = gltf.scene;
        obj.traverse( function ( child ) {
          if ( child.isMesh ) {
            child.castShadow = true;
          }
        });
        
        obj.scale.set(1, 1, 1);
        asset.object = gltf.scene;
        asset.object.position.set(newShot.position.x, newShot.position.y, newShot.position.z);
        asset.object.rotateX(-3.14/2);
        asset.object.name = name;
        obj.position.set(newShot.position.x, newShot.position.y, newShot.position.z);
        
        shotsOnScreen.push(asset);
        
        scn.add(obj);
      }, null, null);

      setTimeout(() => {
        player.canMissel = true;
      }, 2000);
    }
  }
}

export function moveShots(){
  for(const shot of shots){

    if(shot.type === 1){
      shot.translateZ(1.2);
      if(shot.position.z < -90) { 
        shot.removeFromParent();
        const indexToRemove = shots.indexOf(shot);
        shots.splice(indexToRemove, 1);
        shotsCounter--;
      }
    }

    if(shot.type === 2){
      if(shot.position.y < 36){
          shot.translateY(1.2);
      } else{
        if(!shot.rodou){
          shot.rotateX(90 * (Math.PI/180));
        }
        shot.rodou = true;
        shot.translateY(1.2);
      }
      if(shot.position.y > 60){
        shot.removeFromParent();
        const indexToRemove = shots.indexOf(shot);
        shots.splice(indexToRemove, 1);
        shotsCounter--;
      }
    }

    if(shot.type === 3){
      shot.translateY(-2);
      if(shot.position.z < -190){
        shot.removeFromParent();
        const indexToRemove = shots.indexOf(shot);
        shots.splice(indexToRemove, 1);
        shotsCounter--;
      }
    }

    if(shot.type === 4){
      const index = shotsOnScreen.findIndex(st => st.object.name === shot.name);
      const aux = shotsOnScreen[index];

      if(aux !== undefined && aux.object) {
        shot.translateY(1);
        shot.rotateX(-1 * (Math.PI/180) / 2);

        aux.object.translateY(1);
        aux.object.rotateX(-1 * (Math.PI/180) / 2);

        if(shot.position.x > 110 || shot.position.y > 110 || shot.position.z > 110){
          shot.removeFromParent();
          aux.object.removeFromParent();

          const indexToRemove = shots.indexOf(shot);
          shots.splice(indexToRemove, 1);
          shotsCounter--;
          
          shotsOnScreen.splice(index, 1);
        }
      }
    }
  }
}

export function clearShots(){
  for(const shot of shots){
      shot.removeFromParent();
  }
  shots = [];
  shotsCounter = 0;
}

export function removeGrenade(name) {
  const index = shotsOnScreen.findIndex(st => st.object.name === name);
  const aux = shotsOnScreen[index];

  aux.object.removeFromParent();
}

export function decrementaShots(){
  shotsCounter--;
}

export{
  shots,
  shotsCounter,
}