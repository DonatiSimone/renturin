const sqlite3 = require('sqlite3').verbose();


class DataBase{
    constructor() {
        this.db = new sqlite3.Database('renturin.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
            return console.error(err.message)
            }
        });
    }
    close() {
        this.db.close((err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log("Connessione al database chiusa.");
            }
        });
    }
    all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    run(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function(err) {
                if (err) {
                    console.error('Error executing query:', err);
                    reject(err);
                } else {
                    console.log(`Query executed successfully.`);
                    resolve(this.changes);
                }
            });
        });
    }
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    addNewUser(newUser, hashedPassword) {
        const sql = `INSERT INTO user (
            first_name, surname, email, user_password, prefix, phone_number,
            birth_year, birth_month, birth_day, driver_license_number,
            driver_license_country, driver_license_year, driver_license_month,
            driver_license_day, id_card_number, id_card_country, id_card_year,
            id_card_month, id_card_day, credit_card_number, credit_card_year,
            credit_card_month, billing_address, billing_address_city,
            billing_address_country, zip_code, email_consent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        return new Promise((resolve, reject) => {
            this.db.run(
                sql,
                [
                    newUser.first_name,
                    newUser.surname,
                    newUser.email,
                    hashedPassword,
                    newUser.prefix,
                    newUser.phone_number,
                    newUser.birth_year,
                    newUser.birth_month,
                    newUser.birth_day,
                    newUser.driver_license_number,
                    newUser.driver_license_country,
                    newUser.driver_license_year,
                    newUser.driver_license_month,
                    newUser.driver_license_day,
                    newUser.id_card_number,
                    newUser.id_card_country,
                    newUser.id_card_year,
                    newUser.id_card_month,
                    newUser.id_card_day,
                    newUser.credit_card_number,
                    newUser.credit_card_year,
                    newUser.credit_card_month,
                    newUser.billing_address,
                    newUser.billing_address_city,
                    newUser.billing_address_country,
                    newUser.zip_code,
                    newUser.email_consent
                ],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID });
                    }
                }
            );
        });
    }

    getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM user WHERE email = ?", [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
    getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM user WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
    updateUserById(id, updateData) {
        const { first_name, surname, email, phone_number, billing_address, billing_address_city, billing_address_country, zip_code } = updateData;
        const sql = `UPDATE user SET
            first_name = ?, surname = ?, email = ?, phone_number = ?,
            billing_address = ?, billing_address_city = ?, billing_address_country = ?, zip_code = ?
            WHERE id = ?`;

        return new Promise((resolve, reject) => {
            this.db.run(
                sql,
                [
                    first_name,
                    surname,
                    email,
                    phone_number,
                    billing_address,
                    billing_address_city,
                    billing_address_country,
                    zip_code,
                    id
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                }
            );
        });
    }
}

const dbInstance = new DataBase();
module.exports = dbInstance;
