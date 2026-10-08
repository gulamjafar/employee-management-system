const express = require("express");
const Employee = require("../models/Employee");

const router = express.Router();

// Add Employee
router.post("/", async (req, res) => {
    try {
        const employee = new Employee(req.body);
        const savedEmployee = await employee.save();

        res.status(201).json({
            message: "Employee added successfully!",
            employee: savedEmployee
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to add employee",
            error: error.message
        });
    }
});

// Get All Employees
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find();

        res.status(200).json({
            message: "Employees fetched successfully!",
            employees
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch employees",
            error: error.message
        });
    }
});

// Get Single Employee
router.get("/:id", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            employee
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch employee",
            error: error.message
        });
    }
});

// Update Employee
router.put("/:id", async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee updated successfully!",
            employee
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to update employee",
            error: error.message
        });
    }
});

// Delete Employee
router.delete("/:id", async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(
            req.params.id
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee deleted successfully!",
            employee
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete employee",
            error: error.message
        });
    }
});

module.exports = router;