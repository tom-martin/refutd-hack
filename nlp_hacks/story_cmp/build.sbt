import AssemblyKeys._

organization := "top10"

name := "story_cmp"

version := "1.0.0-SNAPSHOT"

scalaVersion := "2.9.1"

seq(assemblySettings: _*)

jarName in assembly := "story_cmp.jar"

test in assembly := {}


libraryDependencies ++= Seq(
  "ch.qos.logback" % "logback-classic" % "1.0.0" % "runtime",
  "junit" % "junit" % "4.8.2" % "test"
)

resolvers += "Local Maven Repository" at "file://"+Path.userHome.absolutePath+"/.m2/repository"

resolvers += "Sonatype OSS Snapshots" at "http://oss.sonatype.org/content/repositories/snapshots/"

resolvers += "Scala-Tools Maven2 Releases Repository" at "http://scala-tools.org/repo-releases"
