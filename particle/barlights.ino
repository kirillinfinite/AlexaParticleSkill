// This #include statement was automatically added by the Particle IDE.
#include "IRremote.h"
 
int commandDevice(String command);
int isLightOn = 0;
int photoresistor = A0;
int power = A5; // Photoresistor pin
 
IRsend irsend(D3); // hardwired to pin 3;  

//TODO: transistor to drive the IR LED for maximal range
 
void setup()
{
  pinMode(photoresistor,INPUT);  // Photoresistor pin is input (reading the photoresistor)
  pinMode(power,OUTPUT); // The pin powering the photoresistor is output (sending out consistent power)
  digitalWrite(power,HIGH);
  Particle.function("toggle", commandDevice);
  Particle.variable("isLightOn", isLightOn);
}
 
int commandDevice(String command)
{
    if (command == "on")
    {
        turnOnBarLight();
    }
    
    if (command == "off")
    {
        turnOffBarLight();
    }
    
    else return 0;
    
}

int blastIR() {
    irsend.sendNEC(0xFF02FD, 32);
    Particle.publish("Sent remote code", PRIVATE);
    return analogRead(photoresistor);
}

int turnOnBarLight() {
    if (analogRead(photoresistor) < 300) {
        blastIR();
    }   else {
        return 0;
    }
}

int turnOffBarLight() {
    if (analogRead(photoresistor) > 300) {
        blastIR();
    }   else {
        return 0;
    }
}


void loop()
{
    
}