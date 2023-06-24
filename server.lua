-- This resource was made by plesalex100#7387
-- Please respect it, don't repost it without my permission
-- This Resource started from: https://codepen.io/AdrianSandu/pen/MyBQYz
-- ESX Version: saNhje & wUNDER

ESX = nil
TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)

RegisterServerEvent("esx_slots:BetsAndMoney")
AddEventHandler("esx_slots:BetsAndMoney", function(bets)
    local _source   = source
    local xPlayer   = ESX.GetPlayerFromId(_source)
    if xPlayer then
        if bets % 20 == 0 and bets >= 10 then
            if xPlayer.getMoney() >= bets then
                xPlayer.removeMoney(bets)
                TriggerClientEvent("esx_slots:UpdateSlots", _source, bets)
            else
                TriggerClientEvent('esx:showNotification', _source, "Du hast nicht genug Geld.")
            end
        else
            TriggerClientEvent('esx:showNotification', _source, "Sie müssen eine Grade zahl eingeben (500, 550, 1000, 1250...)")
        end

    end
end)

RegisterServerEvent("esx_slots:PayOutRewards")
AddEventHandler("esx_slots:PayOutRewards", function(amount)
    local _source   = source
    local xPlayer   = ESX.GetPlayerFromId(_source)
    if xPlayer then
        amount = tonumber(amount)
        if amount > 0 then
            xPlayer.addMoney(amount)
            TriggerClientEvent('esx:showNotification', _source, "Du hast "..amount.."$ gewonnen.")
        else
            TriggerClientEvent('esx:showNotification', _source, "Du hast verloren.")
        end
    end
end)
