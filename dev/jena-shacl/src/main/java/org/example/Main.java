package org.example;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.util.FileUtils;
import org.topbraid.jenax.util.JenaUtil;
import org.topbraid.shacl.util.ModelPrinter;
import org.topbraid.shacl.validation.ValidationUtil;

public class Main {

    public static void main(String[] args) {
        Model dataModel = JenaUtil.createMemoryModel();
        dataModel.read(Main.class.getResourceAsStream("/data.ttl"), "urn:dummy", FileUtils.langTurtle);

        Model shapesModel = JenaUtil.createMemoryModel();
        shapesModel.read(Main.class.getResourceAsStream("/shapes.ttl"), "urn:dummy", FileUtils.langTurtle);

        Resource report = ValidationUtil.validateModel(dataModel, shapesModel, true);

        System.out.println(ModelPrinter.get().print(report.getModel()));
    }
}
