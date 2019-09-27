// FOR THE AUTOMATIC LED ADJUSTMENTS
int lightsPin = 3;             // the pin that control the lights
int ltSenrPin = A0;            // The pin that gets input from the light sensor
double minBright = 0;          // The minimum brightness value of the lights
double maxBright = 255;        // The maximum brightness value of the lights
double maxSensorInput = 325;   // The maximum value expected from the light sensor
double minSensorInput = 50;    // The minumum value expected from the light sensor
double slope = (minBright - maxBright)/(maxSensorInput - minSensorInput);  // The rate at which the bightness of the lights change
int yInt = (minBright - maxSensorInput*slope);  // The birghtness value given when the sensor gives a reading of 0


// FOR THE DISTANCE SENSOR
int triggerPin = 10; //The pin that we send a signal to
int echoPin = 9;     //The pin that listens to the echo

double slopeEcho = .01693721; //The rate of change of the distance as duration increases (based off data gathered)
double duration = 0.0; //The time it takes for the echo to be recieved (in microseconds)
double distance = 0.0; //The calculated distance the object is



void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

  // LIGHT SENSOR
  pinMode(lightsPin, OUTPUT);
  pinMode(ltSenrPin, INPUT);
  digitalWrite(lightsPin, LOW);


  // DISTANCE SENSOR
  pinMode(echoPin, INPUT);
  pinMode(triggerPin, OUTPUT);

}

void loop() {
  // put your main code here, to run repeatedly:

  // LIGHT SENSOR
  if (analogRead(ltSenrPin) <= maxSensorInput && analogRead(ltSenrPin) >= minSensorInput){
  analogWrite(lightsPin, (int)((double)analogRead(ltSenrPin)*slope + yInt));
  }
  else if (analogRead(ltSenrPin) > maxSensorInput) {
    analogWrite(lightsPin, minBright);
  }
  else if (analogRead(ltSenrPin) < minSensorInput){
    analogWrite(lightsPin, maxBright);
  }

  // DISTANCE SENSOR
  digitalWrite(triggerPin, LOW);
  delayMicroseconds(2);
  digitalWrite(triggerPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(triggerPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  
  distance = slopeEcho*duration;
  Serial.println(distance);
  delay(10);

  





}
